// ============================================================
// Storage helpers
// ============================================================
const STORAGE_KEY = 'qr_contacto_v1';

function getProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveProject(project) {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.push(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

  // Sync to Firestore (best-effort, doesn't block UI)
  const doSave = () => window.fbSave(project).catch(e => console.warn('fbSave:', e));
  if (window.firebaseReady) doSave();
  else document.addEventListener('firebase-ready', doSave, { once: true });
}

function removeProject(id) {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

  if (window.firebaseReady) {
    window.fbDelete(id).catch(e => console.warn('fbDelete:', e));
  }
}

function projectNameExists(name) {
  return getProjects().some(
    p => p.name.toLowerCase() === name.toLowerCase()
  );
}

// ============================================================
// URL encoding — compress data into a URL-safe string
// ============================================================
function encodeData(data) {
  return LZString.compressToEncodedURIComponent(JSON.stringify(data));
}

function buildViewerUrl(data) {
  const encoded = encodeData(data);
  // Build base URL: same origin + path up to the filename
  const pathBase = window.location.pathname.replace(/\/[^/]*$/, '');
  return `${window.location.origin}${pathBase}/view.html#${encoded}`;
}

// ============================================================
// Step management
// ============================================================
let currentName = '';
let extraFieldCount = 0;
let currentFullUrl  = '';   // is.gd URL con todos los datos
let currentMiniText = '';   // solo número de teléfono, para QR 21×21
let currentQrMode   = 'full'; // 'full' | 'mini'

function currentQrValue() {
  return currentQrMode === 'mini' && currentMiniText ? currentMiniText : currentFullUrl;
}

function showStep(n) {
  ['step-1', 'step-2', 'step-3'].forEach(id => {
    document.getElementById(id).style.display = id === `step-${n}` ? 'block' : 'none';
  });
}

// ============================================================
// Step 1 — project name
// ============================================================
function renderExistingProjects() {
  const projects = getProjects();
  const section = document.getElementById('existing-projects-section');
  const list = document.getElementById('existing-projects-list');

  if (projects.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  list.innerHTML = projects
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(p => `
      <div class="project-item">
        <div class="project-item-info">
          <strong>${esc(p.name)}</strong>
          <span class="project-date">${new Date(p.createdAt).toLocaleDateString(currentLang, { day:'2-digit', month:'short', year:'numeric' })}</span>
        </div>
        <div class="project-item-actions">
          <a href="${esc(p.url)}" target="_blank" class="btn btn-sm btn-secondary">${t('proj.view')}</a>
          <button class="btn btn-sm btn-secondary" onclick="showQrForProject('${esc(p.id)}')">${t('proj.qr')}</button>
          <button class="btn-danger btn" onclick="confirmDelete('${esc(p.id)}', '${esc(p.name)}')">✕</button>
        </div>
      </div>
    `).join('');
}

document.getElementById('btn-continue').addEventListener('click', handleContinue);
document.getElementById('project-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleContinue();
});

function handleContinue() {
  const input = document.getElementById('project-name');
  const name = input.value.trim();
  const errorEl = document.getElementById('name-error');

  if (!name) {
    showError(errorEl, t('err.empty'));
    input.focus();
    return;
  }

  if (projectNameExists(name)) {
    showError(errorEl, t('err.exists', { n: esc(name) }));
    input.select();
    return;
  }

  hideError(errorEl);
  currentName = name;
  document.getElementById('project-badge').textContent = name;
  showStep(2);
}

// ============================================================
// Step 2 — rich text editor
// ============================================================
const editor = document.getElementById('f-instructions');

document.getElementById('editor-toolbar').addEventListener('mousedown', e => {
  const btn = e.target.closest('.tool-btn');
  if (!btn) return;
  e.preventDefault(); // keep focus in editor
  const cmd = btn.dataset.cmd;
  const val = btn.dataset.val || null;
  document.execCommand(cmd, false, val);
  editor.focus();
  syncToolbarState();
});

editor.addEventListener('keyup', syncToolbarState);
editor.addEventListener('mouseup', syncToolbarState);
editor.addEventListener('input', updateCharCounter);

function syncToolbarState() {
  ['bold', 'italic', 'underline'].forEach(cmd => {
    const btn = document.querySelector(`.tool-btn[data-cmd="${cmd}"]`);
    if (btn) btn.classList.toggle('active', document.queryCommandState(cmd));
  });
}

function updateCharCounter() {
  const text = editor.innerText || '';
  const len = text.trim().length;
  const counter = document.getElementById('char-counter');
  counter.textContent = `${len} caracteres`;
  // Warn above 400 chars — QR gets complex beyond that
  counter.classList.toggle('warn', len > 400);
}

// ============================================================
// Extra fields
// ============================================================
document.getElementById('btn-add-field').addEventListener('click', () => {
  document.getElementById('add-field-form').style.display = 'flex';
  document.getElementById('btn-add-field').style.display = 'none';
  document.getElementById('new-field-label').focus();
});

document.getElementById('btn-cancel-add').addEventListener('click', hideAddFieldForm);

document.getElementById('btn-confirm-add').addEventListener('click', addExtraField);

document.getElementById('new-field-label').addEventListener('keydown', e => {
  if (e.key === 'Enter') addExtraField();
  if (e.key === 'Escape') hideAddFieldForm();
});

function addExtraField() {
  const labelInput = document.getElementById('new-field-label');
  const label = labelInput.value.trim();
  if (!label) {
    labelInput.focus();
    return;
  }

  const id = `extra-${++extraFieldCount}`;
  const container = document.getElementById('extra-fields');
  const div = document.createElement('div');
  div.className = 'field extra-field';
  div.dataset.extraId = id;
  div.innerHTML = `
    <label>
      ${esc(label)}
      <button class="btn-remove-field" title="Eliminar campo">✕</button>
    </label>
    <input type="text" id="${id}" placeholder="...">
  `;
  div.querySelector('.btn-remove-field').addEventListener('click', () => div.remove());
  container.appendChild(div);

  labelInput.value = '';
  hideAddFieldForm();
  document.getElementById(id).focus();
}

function hideAddFieldForm() {
  document.getElementById('add-field-form').style.display = 'none';
  document.getElementById('btn-add-field').style.display = 'flex';
  document.getElementById('new-field-label').value = '';
}

// ============================================================
// Back button
// ============================================================
document.getElementById('btn-back').addEventListener('click', () => {
  resetStep2();
  showStep(1);
});

function resetStep2() {
  document.getElementById('f-name').value = '';
  document.getElementById('f-email').value = '';
  document.getElementById('f-whatsapp').value = '';
  editor.innerHTML = '';
  updateCharCounter();
  document.getElementById('extra-fields').innerHTML = '';
  extraFieldCount = 0;
  hideAddFieldForm();
}

// ============================================================
// URL shortener — reduces QR density for small stickers
// ============================================================
async function shortenUrl(longUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const resp = await fetch(
      `https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!resp.ok) throw new Error('not ok');
    const text = (await resp.text()).trim();
    if (!text.startsWith('http')) throw new Error('bad response');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

function renderQrCode(container, url) {
  container.innerHTML = '';
  // Level L = mínima corrección de errores → QR más simple, imprimible en espacios pequeños
  new QRCode(container, {
    text: url,
    width: 220,
    height: 220,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.L,
  });
}

// ============================================================
// Generate QR
// ============================================================
document.getElementById('btn-generate').addEventListener('click', generateQr);

async function generateQr() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) {
    alert(t('err.noname'));
    document.getElementById('f-name').focus();
    return;
  }

  // Collect extra fields (only non-empty values)
  const extraFields = [];
  document.querySelectorAll('#extra-fields .extra-field').forEach(div => {
    const id = div.dataset.extraId;
    const labelNode = div.querySelector('label').childNodes[0];
    const label = labelNode ? labelNode.textContent.trim() : '';
    const value = document.getElementById(id)?.value.trim() || '';
    if (label && value) extraFields.push({ label, value });
  });

  const whatsapp = document.getElementById('f-whatsapp').value.trim();

  const data = {
    projectName: currentName,
    name,
    email: document.getElementById('f-email').value.trim(),
    whatsapp,
    instructions: editor.innerHTML,
    extraFields,
    createdAt: new Date().toISOString(),
  };

  const longUrl = buildViewerUrl(data);

  // Número limpio para el QR mini (+DIGITOS = versión 1, 21×21 módulos)
  const phoneDigits = whatsapp.replace(/\D/g, '');
  currentMiniText = phoneDigits ? `+${phoneDigits}` : '';

  // Mostrar paso 3 con spinner mientras acortamos
  document.getElementById('qr-label').textContent = currentName;
  document.getElementById('qr-code').innerHTML = '';
  document.getElementById('qr-loading').style.display = 'flex';
  document.getElementById('qr-url-box').textContent = '';
  document.getElementById('qr-mode-toggle').style.display = 'none';
  document.getElementById('qr-mode-desc').textContent = '';
  showStep(3);

  // Acortar URL para el modo completo
  let shortUrl = longUrl;
  try {
    shortUrl = await shortenUrl(longUrl);
  } catch {
    // Fallback a URL larga
  }
  currentFullUrl = shortUrl;

  // Guardar proyecto (contact se guarda separado para Firestore/admin)
  const project = {
    id: `${currentName}-${Date.now()}`,
    name: currentName,
    url: longUrl,
    shortUrl: shortUrl !== longUrl ? shortUrl : null,
    miniText: currentMiniText || null,
    createdAt: data.createdAt,
    contact: {
      name:        data.name,
      email:       data.email,
      whatsapp:    data.whatsapp,
      instructions: data.instructions,
      extraFields: data.extraFields,
    },
  };
  saveProject(project);

  // Ocultar spinner
  document.getElementById('qr-loading').style.display = 'none';

  // Activar modo mini por defecto si hay teléfono, sino completo
  currentQrMode = currentMiniText ? 'mini' : 'full';
  applyQrMode();
  renderExistingProjects();
}

// ============================================================
// Cambio de modo Mini ↔ Completo
// ============================================================
function applyQrMode() {
  const toggle = document.getElementById('qr-mode-toggle');
  const desc   = document.getElementById('qr-mode-desc');
  const value  = currentQrValue();

  // Mostrar toggle solo si hay mini disponible
  if (currentMiniText) {
    toggle.style.display = 'flex';
    document.getElementById('btn-mode-mini').classList.toggle('active', currentQrMode === 'mini');
    document.getElementById('btn-mode-full').classList.toggle('active', currentQrMode === 'full');
  } else {
    toggle.style.display = 'none';
  }

  if (currentQrMode === 'mini') {
    desc.textContent = t('mode.mini.desc');
    desc.className = 'qr-mode-desc desc-mini';
  } else {
    desc.textContent = t('mode.full.desc');
    desc.className = 'qr-mode-desc desc-full';
  }

  document.getElementById('qr-url-box').textContent = value;
  renderQrCode(document.getElementById('qr-code'), value);
}

document.getElementById('btn-mode-mini').addEventListener('click', () => {
  currentQrMode = 'mini';
  applyQrMode();
});

document.getElementById('btn-mode-full').addEventListener('click', () => {
  currentQrMode = 'full';
  applyQrMode();
});

// ============================================================
// Step 3 actions
// ============================================================
document.getElementById('btn-copy-link').addEventListener('click', () => {
  const value = currentFullUrl;
  navigator.clipboard.writeText(value).then(() => {
    const btn = document.getElementById('btn-copy-link');
    btn.textContent = t('s3.copied');
    setTimeout(() => { btn.textContent = t('s3.copy'); }, 2000);
  }).catch(() => {
    const tmp = document.createElement('textarea');
    tmp.value = value;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    tmp.remove();
  });
});

document.getElementById('btn-create-another').addEventListener('click', () => {
  document.getElementById('project-name').value = '';
  hideError(document.getElementById('name-error'));
  resetStep2();
  renderExistingProjects();
  showStep(1);
});

document.getElementById('btn-view-all').addEventListener('click', () => {
  document.getElementById('project-name').value = '';
  renderExistingProjects();
  showStep(1);
  setTimeout(() => {
    document.getElementById('existing-projects-section').scrollIntoView({ behavior: 'smooth' });
  }, 50);
});

// ============================================================
// Show QR for an existing saved project
// ============================================================
function showQrForProject(id) {
  const project = getProjects().find(p => p.id === id);
  if (!project) return;

  currentName     = project.name;
  currentFullUrl  = project.shortUrl || project.url;
  currentMiniText = project.miniText || '';
  currentQrMode   = currentMiniText ? 'mini' : 'full';

  document.getElementById('qr-label').textContent = project.name;
  document.getElementById('qr-loading').style.display = 'none';

  applyQrMode();
  showStep(3);
}

// ============================================================
// Delete project
// ============================================================
function confirmDelete(id, name) {
  if (confirm(t('del.confirm', { n: name }))) {
    removeProject(id);
    renderExistingProjects();
  }
}

// ============================================================
// Utilities
// ============================================================
function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

function showError(el, html) {
  el.innerHTML = html;
  el.style.display = 'block';
}

function hideError(el) {
  el.style.display = 'none';
  el.innerHTML = '';
}

// ============================================================
// Firestore sync — load all projects from cloud on startup
// ============================================================
function syncFromFirebase() {
  function doSync() {
    window.fbLoad()
      .then(fbProjects => {
        if (!fbProjects || fbProjects.length === 0) return;
        // Firestore is source of truth: merge into localStorage
        const local   = getProjects();
        const localMap = Object.fromEntries(local.map(p => [p.id, p]));
        fbProjects.forEach(p => { localMap[p.id] = p; });
        const merged = Object.values(localMap);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        renderExistingProjects();
      })
      .catch(e => console.warn('fbLoad:', e));
  }

  if (window.firebaseReady) doSync();
  else document.addEventListener('firebase-ready', doSync, { once: true });
}

// ============================================================
// Init
// ============================================================
initLangSwitcher();

// Re-render dynamic content when language changes
const _origSetLang = setLang;
window.setLang = function(lang) {
  _origSetLang(lang);
  renderExistingProjects();
  // Refresh mode desc if on step 3
  if (document.getElementById('step-3').style.display !== 'none') {
    applyQrMode();
  }
};
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.onclick = () => window.setLang(btn.dataset.lang);
});

syncFromFirebase();
renderExistingProjects();
showStep(1);

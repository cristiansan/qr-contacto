// ============================================================
// Storage helpers
// ============================================================
const STORAGE_KEY = 'qr_contacto_v1';
const ANON_KEY    = 'qr_anon_created';

function getProjects() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveProject(project) {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.push(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

  const doSave = () => window.fbSave(project).catch(e => console.warn('fbSave:', e));
  if (window.firebaseReady) doSave();
  else document.addEventListener('firebase-ready', doSave, { once: true });
}

function removeProject(id) {
  localStorage.setItem(STORAGE_KEY,
    JSON.stringify(getProjects().filter(p => p.id !== id)));
  if (window.firebaseReady)
    window.fbDelete(id).catch(e => console.warn('fbDelete:', e));
}

function projectNameExists(name, excludeId = null) {
  return getProjects().some(
    p => p.name.toLowerCase() === name.toLowerCase() && p.id !== excludeId
  );
}

// ============================================================
// URL helpers
// ============================================================
function makeProjectId(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slug}-${Date.now()}`;
}

function buildViewerUrl(projectId) {
  const pathBase = window.location.pathname.replace(/\/[^/]*$/, '');
  return `${window.location.origin}${pathBase}/view.html#${encodeURIComponent(projectId)}`;
}

// ============================================================
// State
// ============================================================
let currentName     = '';
let extraFieldCount = 0;
let currentFullUrl  = '';
let currentMiniText = '';
let currentQrMode   = 'full';
let editingProject  = null;   // project object being edited, or null

function currentQrValue() {
  return currentQrMode === 'mini' && currentMiniText
    ? currentMiniText : currentFullUrl;
}

function showStep(n) {
  ['step-1', 'step-2', 'step-3'].forEach(id => {
    document.getElementById(id).style.display = id === `step-${n}` ? 'block' : 'none';
  });
}

// ============================================================
// Auth UI helpers
// ============================================================
function updateAuthBar(user) {
  const bar      = document.getElementById('auth-bar');
  const btnSignIn = document.getElementById('btn-signin');
  const userPill  = document.getElementById('user-pill');
  const pillAvatar= document.getElementById('pill-avatar');
  const pillName  = document.getElementById('pill-name');

  if (user) {
    btnSignIn.style.display = 'none';
    userPill.style.display  = 'flex';
    pillName.textContent    = user.displayName || user.email.split('@')[0];
    setAvatarEl(pillAvatar, user.photoURL, user.displayName || user.email);
  } else {
    btnSignIn.style.display = 'inline-flex';
    userPill.style.display  = 'none';
  }

  renderExistingProjects();
  updateCreateButton();
}

function setAvatarEl(el, photoURL, name) {
  if (photoURL) {
    el.innerHTML = `<img src="${photoURL}" alt="">`;
  } else {
    const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    el.textContent = initials;
  }
}

function updateCreateButton() {
  const user    = window.currentUser;
  const isAnon  = !user;
  const hasAnon = !!localStorage.getItem(ANON_KEY);
  const blocked = isAnon && hasAnon;

  const input   = document.getElementById('project-name');
  const btn     = document.getElementById('btn-continue');
  const notice  = document.getElementById('anon-notice');

  if (blocked) {
    input.disabled       = true;
    btn.disabled         = true;
    notice.style.display = 'block';
  } else {
    input.disabled       = false;
    btn.disabled         = false;
    notice.style.display = 'none';
  }
}

// ============================================================
// Modals
// ============================================================
function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// — Auth modal —
document.getElementById('btn-signin').addEventListener('click', () => openModal('modal-auth'));
document.getElementById('btn-close-auth').addEventListener('click', () => closeModal('modal-auth'));

// Tab switcher
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('tab-login').style.display    = tab === 'login'    ? 'block' : 'none';
    document.getElementById('tab-register').style.display = tab === 'register' ? 'block' : 'none';
  });
});

// Google sign-in
document.getElementById('btn-google').addEventListener('click', async () => {
  try {
    await window.fbSignInGoogle();
    closeModal('modal-auth');
  } catch (e) {
    showAuthError(e.message);
  }
});

// Email login
document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('auth-email').value.trim();
  const pass  = document.getElementById('auth-pass').value;
  try {
    await window.fbSignInEmail(email, pass);
    closeModal('modal-auth');
  } catch (e) {
    showAuthError(e.message);
  }
});

// Email register
document.getElementById('btn-register').addEventListener('click', async () => {
  const name  = document.getElementById('auth-name').value.trim();
  const email = document.getElementById('auth-email-reg').value.trim();
  const pass  = document.getElementById('auth-pass-reg').value;
  try {
    await window.fbRegisterEmail(email, pass, name);
    closeModal('modal-auth');
  } catch (e) {
    showAuthError(e.message, true);
  }
});

function showAuthError(msg, isReg = false) {
  const el = document.getElementById(isReg ? 'auth-error-reg' : 'auth-error');
  el.textContent  = msg;
  el.style.display = 'block';
}

// Close modal clicking backdrop
document.getElementById('modal-auth').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal('modal-auth');
});

// — Profile modal —
document.getElementById('user-pill').addEventListener('click', openProfileModal);
document.getElementById('btn-close-profile').addEventListener('click', () => closeModal('modal-profile'));
document.getElementById('modal-profile').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal('modal-profile');
});

document.getElementById('btn-signout').addEventListener('click', async () => {
  await window.fbSignOut();
  closeModal('modal-profile');
});

document.getElementById('btn-save-profile').addEventListener('click', saveProfile);

document.getElementById('profile-photo-input').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  const base64 = await resizeToBase64(file, 128);
  document.getElementById('profile-photo-preview').style.backgroundImage = `url(${base64})`;
  document.getElementById('profile-photo-preview').dataset.photoUrl = base64;
});

async function openProfileModal() {
  if (!window.currentUser) return;
  const user    = window.currentUser;
  const profile = window.firebaseReady
    ? await window.fbLoadProfile(user.uid).catch(() => null)
    : null;

  const photoURL = profile?.photoURL || user.photoURL || '';
  const name     = profile?.displayName || user.displayName || '';

  document.getElementById('profile-name').value  = name;
  document.getElementById('profile-email').value = user.email || '';

  const preview = document.getElementById('profile-photo-preview');
  if (photoURL) {
    preview.style.backgroundImage = `url(${photoURL})`;
    preview.dataset.photoUrl = photoURL;
  } else {
    preview.style.backgroundImage = '';
    preview.dataset.photoUrl = '';
    preview.textContent = (name || user.email || '?')[0].toUpperCase();
  }

  document.getElementById('profile-error').style.display = 'none';
  openModal('modal-profile');
}

async function saveProfile() {
  const user    = window.currentUser;
  if (!user) return;

  const name    = document.getElementById('profile-name').value.trim();
  const preview = document.getElementById('profile-photo-preview');
  const photoURL = preview.dataset.photoUrl || '';

  try {
    const profileData = {
      uid: user.uid, email: user.email,
      displayName: name, photoURL,
      updatedAt: new Date().toISOString(),
    };
    await window.fbSaveProfile(user.uid, profileData);

    // Update auth bar
    document.getElementById('pill-name').textContent = name || user.email.split('@')[0];
    const pillAvatar = document.getElementById('pill-avatar');
    setAvatarEl(pillAvatar, photoURL, name);

    closeModal('modal-profile');
  } catch (e) {
    const el = document.getElementById('profile-error');
    el.textContent  = e.message;
    el.style.display = 'block';
  }
}

function resizeToBase64(file, size) {
  return new Promise(resolve => {
    const img    = new Image();
    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale  = Math.min(size / img.width, size / img.height);
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
    };
    reader.readAsDataURL(file);
  });
}

// ============================================================
// Step 1 — project list
// ============================================================
function renderExistingProjects() {
  const user     = window.currentUser;
  const isAdmin  = window.fbIsAdmin?.() || false;
  const uid      = user?.uid || null;
  const section  = document.getElementById('existing-projects-section');
  const list     = document.getElementById('existing-projects-list');

  let projects = getProjects()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Filter: admin sees all, logged-in sees own, anon sees nothing
  if (!user) {
    section.style.display = 'none';
    return;
  }
  if (!isAdmin) {
    projects = projects.filter(p => p.userId === uid);
  }

  if (projects.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  const title = isAdmin ? t('s1.allProjects') : t('s1.saved');
  document.querySelector('#existing-projects-section h3').textContent = title;

  list.innerHTML = projects.map(p => {
    const isOwner = p.userId === uid;
    const canEdit = isAdmin || isOwner;
    const canDel  = isAdmin;
    const who     = isAdmin && p.userEmail
      ? `<span class="project-owner">${esc(p.userEmail)}</span>` : '';

    return `
      <div class="project-item">
        <div class="project-item-info">
          <strong>${esc(p.name)}</strong>
          ${who}
          <span class="project-date">${new Date(p.createdAt).toLocaleDateString(currentLang, { day:'2-digit', month:'short', year:'numeric' })}</span>
        </div>
        <div class="project-item-actions">
          <a href="${esc(p.url)}" target="_blank" class="btn btn-sm btn-secondary">${t('proj.view')}</a>
          <button class="btn btn-sm btn-secondary" onclick="showQrForProject('${esc(p.id)}')">${t('proj.qr')}</button>
          ${canEdit ? `<button class="btn btn-sm btn-secondary" onclick="startEditProject('${esc(p.id)}')">${t('proj.edit')}</button>` : ''}
          ${canDel  ? `<button class="btn btn-danger btn" onclick="confirmDelete('${esc(p.id)}','${esc(p.name)}')">✕</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

document.getElementById('btn-continue').addEventListener('click', handleContinue);
document.getElementById('project-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleContinue();
});

function handleContinue() {
  const input   = document.getElementById('project-name');
  const name    = input.value.trim();
  const errorEl = document.getElementById('name-error');

  if (!name) { showError(errorEl, t('err.empty')); input.focus(); return; }

  if (projectNameExists(name)) {
    showError(errorEl, t('err.exists', { n: esc(name) }));
    input.select();
    return;
  }

  hideError(errorEl);
  editingProject = null;
  currentName    = name;
  document.getElementById('project-badge').textContent = name;
  document.getElementById('step2-mode-label').textContent = t('s2.newLabel') || '';
  showStep(2);
}

// ============================================================
// Step 2 — edit existing project
// ============================================================
function startEditProject(id) {
  const project = getProjects().find(p => p.id === id);
  if (!project) return;

  editingProject = project;
  currentName    = project.name;

  document.getElementById('project-badge').textContent = project.name;
  document.getElementById('step2-mode-label').textContent = t('s2.editing') || '✏️';

  // Pre-fill fields
  document.getElementById('f-name').value     = project.contact?.name     || '';
  document.getElementById('f-email').value    = project.contact?.email    || '';
  document.getElementById('f-whatsapp').value = (project.contact?.whatsapp || '').replace(/^\+/, '');
  editor.innerHTML = project.contact?.instructions || '';

  // Extra fields
  document.getElementById('extra-fields').innerHTML = '';
  extraFieldCount = 0;
  (project.contact?.extraFields || []).forEach(f => addExtraField(f.label, f.value));

  updateCharCounter();
  document.getElementById('btn-generate').textContent = t('s2.update');
  showStep(2);
}

// ============================================================
// Step 2 — rich text editor
// ============================================================
const editor = document.getElementById('f-instructions');

document.getElementById('editor-toolbar').addEventListener('mousedown', e => {
  const btn = e.target.closest('.tool-btn');
  if (!btn) return;
  e.preventDefault();
  document.execCommand(btn.dataset.cmd, false, btn.dataset.val || null);
  editor.focus();
  syncToolbarState();
});

editor.addEventListener('keyup', syncToolbarState);
editor.addEventListener('mouseup', syncToolbarState);
editor.addEventListener('input', updateCharCounter);

function syncToolbarState() {
  ['bold', 'italic', 'underline'].forEach(cmd => {
    document.querySelector(`.tool-btn[data-cmd="${cmd}"]`)
      ?.classList.toggle('active', document.queryCommandState(cmd));
  });
}

function updateCharCounter() {
  const len     = (editor.innerText || '').trim().length;
  const counter = document.getElementById('char-counter');
  counter.textContent = `${len}`;
  counter.classList.toggle('warn', len > 400);
}

// ============================================================
// Extra fields
// ============================================================
document.getElementById('btn-add-field').addEventListener('click', () => {
  document.getElementById('add-field-form').style.display = 'flex';
  document.getElementById('btn-add-field').style.display  = 'none';
  document.getElementById('new-field-label').focus();
});

document.getElementById('btn-cancel-add').addEventListener('click', hideAddFieldForm);
document.getElementById('btn-confirm-add').addEventListener('click', () => addExtraField());
document.getElementById('new-field-label').addEventListener('keydown', e => {
  if (e.key === 'Enter')  addExtraField();
  if (e.key === 'Escape') hideAddFieldForm();
});

function addExtraField(labelText, valueText = '') {
  const labelInput = document.getElementById('new-field-label');
  const label = (labelText || labelInput.value).trim();
  if (!label) { if (!labelText) labelInput.focus(); return; }

  const id  = `extra-${++extraFieldCount}`;
  const div = document.createElement('div');
  div.className    = 'field extra-field';
  div.dataset.extraId = id;
  div.innerHTML = `
    <label>${esc(label)}<button class="btn-remove-field">✕</button></label>
    <input type="text" id="${id}" placeholder="..." value="${esc(valueText)}">
  `;
  div.querySelector('.btn-remove-field').addEventListener('click', () => div.remove());
  document.getElementById('extra-fields').appendChild(div);

  labelInput.value = '';
  hideAddFieldForm();
  if (!labelText) document.getElementById(id).focus();
}

function hideAddFieldForm() {
  document.getElementById('add-field-form').style.display = 'none';
  document.getElementById('btn-add-field').style.display  = 'flex';
  document.getElementById('new-field-label').value = '';
}

// ============================================================
// Back button
// ============================================================
document.getElementById('btn-back').addEventListener('click', () => {
  resetStep2();
  editingProject = null;
  showStep(1);
});

function resetStep2() {
  document.getElementById('f-name').value     = '';
  document.getElementById('f-email').value    = '';
  document.getElementById('f-whatsapp').value = '';
  editor.innerHTML = '';
  updateCharCounter();
  document.getElementById('extra-fields').innerHTML = '';
  extraFieldCount = 0;
  hideAddFieldForm();
  document.getElementById('btn-generate').textContent = t('s2.save');
}

// ============================================================
// URL shortener
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
  new QRCode(container, {
    text: url, width: 220, height: 220,
    colorDark: '#000000', colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.L,
  });
}

// ============================================================
// Generate / Update QR
// ============================================================
document.getElementById('btn-generate').addEventListener('click', generateQr);

async function generateQr() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { alert(t('err.noname')); document.getElementById('f-name').focus(); return; }

  const extraFields = [];
  document.querySelectorAll('#extra-fields .extra-field').forEach(div => {
    const id    = div.dataset.extraId;
    const label = div.querySelector('label').childNodes[0].textContent.trim();
    const value = document.getElementById(id)?.value.trim() || '';
    if (label && value) extraFields.push({ label, value });
  });

  const whatsapp  = document.getElementById('f-whatsapp').value.trim();
  const email     = document.getElementById('f-email').value.trim();
  const user      = window.currentUser;
  const projectId = editingProject?.id || makeProjectId(currentName);

  const longUrl     = buildViewerUrl(projectId);
  const phoneDigits = whatsapp.replace(/\D/g, '');
  currentMiniText   = phoneDigits ? `+${phoneDigits}` : '';

  // Show step 3 with spinner
  document.getElementById('qr-label').textContent           = currentName;
  document.getElementById('qr-code').innerHTML              = '';
  document.getElementById('qr-loading').style.display       = 'flex';
  document.getElementById('qr-url-box').textContent         = '';
  document.getElementById('qr-mode-toggle').style.display   = 'none';
  document.getElementById('qr-mode-desc').textContent       = '';
  showStep(3);

  // Shorten
  let shortUrl = longUrl;
  try { shortUrl = await shortenUrl(longUrl); } catch {}
  currentFullUrl = shortUrl;

  // Build project object
  const project = {
    id:        projectId,
    name:      currentName,
    url:       longUrl,
    shortUrl:  shortUrl !== longUrl ? shortUrl : null,
    miniText:  currentMiniText || null,
    createdAt: editingProject?.createdAt || new Date().toISOString(),
    userId:    user?.uid   || null,
    userEmail: user?.email || null,
    contact: {
      name, email, whatsapp, instructions: editor.innerHTML, extraFields,
    },
  };

  saveProject(project);

  // If anon, mark the limit
  if (!user) localStorage.setItem(ANON_KEY, '1');

  document.getElementById('qr-loading').style.display = 'none';
  document.getElementById('qr-url-box').textContent   = shortUrl;

  currentQrMode  = currentMiniText ? 'mini' : 'full';
  applyQrMode();
  renderExistingProjects();
  updateCreateButton();
  editingProject = null;
  resetStep2();
}

// ============================================================
// QR mode toggle
// ============================================================
function applyQrMode() {
  const toggle = document.getElementById('qr-mode-toggle');
  const desc   = document.getElementById('qr-mode-desc');
  const value  = currentQrValue();

  if (currentMiniText) {
    toggle.style.display = 'flex';
    document.getElementById('btn-mode-mini').classList.toggle('active', currentQrMode === 'mini');
    document.getElementById('btn-mode-full').classList.toggle('active', currentQrMode === 'full');
  } else {
    toggle.style.display = 'none';
  }

  desc.textContent = currentQrMode === 'mini' ? t('mode.mini.desc') : t('mode.full.desc');
  desc.className   = `qr-mode-desc ${currentQrMode === 'mini' ? 'desc-mini' : 'desc-full'}`;

  document.getElementById('qr-url-box').textContent = value;
  renderQrCode(document.getElementById('qr-code'), value);
}

document.getElementById('btn-mode-mini').addEventListener('click', () => {
  currentQrMode = 'mini'; applyQrMode();
});
document.getElementById('btn-mode-full').addEventListener('click', () => {
  currentQrMode = 'full'; applyQrMode();
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
  editingProject = null;
  renderExistingProjects();
  showStep(1);
});

document.getElementById('btn-view-all').addEventListener('click', () => {
  document.getElementById('project-name').value = '';
  renderExistingProjects();
  showStep(1);
  setTimeout(() => {
    document.getElementById('existing-projects-section')
      .scrollIntoView({ behavior: 'smooth' });
  }, 50);
});

// ============================================================
// QR for existing project
// ============================================================
function showQrForProject(id) {
  const project = getProjects().find(p => p.id === id);
  if (!project) return;

  currentName     = project.name;
  currentFullUrl  = project.contact ? buildViewerUrl(project.id) : (project.shortUrl || project.url);
  currentMiniText = project.miniText || '';
  currentQrMode   = currentMiniText ? 'mini' : 'full';

  document.getElementById('qr-label').textContent         = project.name;
  document.getElementById('qr-loading').style.display     = 'none';

  applyQrMode();
  showStep(3);
}

// ============================================================
// Delete (admin only)
// ============================================================
function confirmDelete(id, name) {
  if (confirm(t('del.confirm', { n: name }))) {
    removeProject(id);
    renderExistingProjects();
  }
}

// ============================================================
// Firebase sync
// ============================================================
function syncFromFirebase() {
  function doSync() {
    window.fbLoad()
      .then(fbProjects => {
        if (!fbProjects?.length) return;
        const localMap = Object.fromEntries(getProjects().map(p => [p.id, p]));
        fbProjects.forEach(p => { localMap[p.id] = p; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.values(localMap)));
        renderExistingProjects();
      })
      .catch(e => console.warn('fbLoad:', e));
  }
  if (window.firebaseReady) doSync();
  else document.addEventListener('firebase-ready', doSync, { once: true });
}

// ============================================================
// Utilities
// ============================================================
function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}
function showError(el, html) { el.innerHTML = html; el.style.display = 'block'; }
function hideError(el)        { el.style.display = 'none'; el.innerHTML = ''; }

// ============================================================
// Init
// ============================================================
initLangSwitcher();

// Re-render on lang change
const _origSetLang = setLang;
window.setLang = function(lang) {
  _origSetLang(lang);
  renderExistingProjects();
  document.getElementById('btn-generate').textContent = editingProject ? t('s2.update') : t('s2.save');
  if (document.getElementById('step-3').style.display !== 'none') applyQrMode();
};
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.onclick = () => window.setLang(btn.dataset.lang);
});

// Auth state changes
document.addEventListener('auth-changed', e => {
  updateAuthBar(e.detail);
  updateCreateButton();
  syncFromFirebase();
});

// Firebase ready: sync + auth check
document.addEventListener('firebase-ready', () => {
  if (window.currentUser) updateAuthBar(window.currentUser);
});

syncFromFirebase();
renderExistingProjects();
updateCreateButton();
showStep(1);

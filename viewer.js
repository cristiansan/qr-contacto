// ============================================================
// Firebase wait helper
// ============================================================
function waitForFirebase(timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    if (window.firebaseReady) { resolve(); return; }
    const t = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    document.addEventListener('firebase-ready', () => { clearTimeout(t); resolve(); }, { once: true });
  });
}

// ============================================================
// Load contact data — Firebase first, LZString fallback
// ============================================================
async function loadData() {
  const raw = window.location.hash.slice(1);
  if (!raw) return null;

  const hash = decodeURIComponent(raw);

  // Try Firebase (new format: project ID in hash)
  try {
    await waitForFirebase(6000);
    const project = await window.fbLoadProject(hash);
    if (project?.contact) {
      return {
        projectName:  project.name,
        name:         project.contact.name         || '',
        email:        project.contact.email        || '',
        whatsapp:     project.contact.whatsapp     || '',
        instructions: project.contact.instructions || '',
        extraFields:  project.contact.extraFields  || [],
        qrUrl:        project.shortUrl || project.url || window.location.href,
      };
    }
  } catch { /* fall through */ }

  // Fallback: LZString (old QR codes with data encoded in hash)
  try {
    const json = LZString.decompressFromEncodedURIComponent(raw);
    if (json) return JSON.parse(json);
  } catch { /* fall through */ }

  return null;
}

// ============================================================
// Sanitize allowed HTML
// ============================================================
function sanitize(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 'li', 'p', 'br', 'span', 'font'],
    ALLOWED_ATTR: ['style', 'size', 'color'],
  });
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

// ============================================================
// Render contact card
// ============================================================
function render(data) {
  document.title = `${data.name} — QR Contacto`;

  const initials = data.name
    .split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2);
  document.getElementById('contact-avatar').textContent    = initials;
  document.getElementById('contact-name').textContent      = data.name;
  document.getElementById('contact-project').textContent   = data.projectName || '';

  if (data.email) {
    const row  = document.getElementById('row-email');
    const link = document.getElementById('val-email');
    link.href        = `mailto:${data.email}`;
    link.textContent = data.email;
    row.style.display = 'flex';
  }

  if (data.whatsapp) {
    const digits = data.whatsapp.replace(/\D/g, '');
    const row    = document.getElementById('row-whatsapp');
    const link   = document.getElementById('val-whatsapp');
    link.href        = `https://wa.me/${digits}`;
    link.textContent = `+${data.whatsapp.replace(/^\+/, '')}`;
    row.style.display = 'flex';

    const ctaBtn = document.getElementById('whatsapp-btn');
    ctaBtn.href = `https://wa.me/${digits}`;
    document.getElementById('whatsapp-cta').style.display = 'block';
  }

  const instructionsHtml = sanitize(data.instructions || '');
  const tmp = document.createElement('div');
  tmp.innerHTML = instructionsHtml;
  if (tmp.innerText.trim().length > 0) {
    document.getElementById('val-instructions').innerHTML = instructionsHtml;
    document.getElementById('row-instructions').style.display = 'block';
  }

  if (data.extraFields?.length > 0) {
    document.getElementById('extra-fields-view').innerHTML = data.extraFields.map(f => `
      <div class="contact-row">
        <div class="contact-icon">📌</div>
        <div class="contact-info">
          <span class="contact-label">${esc(f.label)}</span>
          <span class="contact-value">${esc(f.value)}</span>
        </div>
      </div>`).join('');
  }

  // QR — use the same shortened URL stored in the project
  new QRCode(document.getElementById('viewer-qr'), {
    text: data.qrUrl || window.location.href,
    width: 88, height: 88,
    colorDark: '#000000', colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.L,
  });
}

// ============================================================
// Init
// ============================================================
async function init() {
  initLangSwitcher();

  const data = await loadData();

  document.getElementById('loading').style.display = 'none';

  if (!data || !data.name) {
    document.getElementById('error-view').style.display = 'block';
    return;
  }

  document.getElementById('contact-card').style.display = 'block';
  render(data);

  // Re-apply i18n labels when lang changes
  const _orig = setLang;
  window.setLang = function(lang) {
    _orig(lang);
    if (data.email)    document.querySelector('#row-email .contact-label').textContent    = t('v.email');
    if (data.whatsapp) document.querySelector('#row-whatsapp .contact-label').textContent = t('v.whatsapp');
    const instrTitle = document.querySelector('#row-instructions .section-title');
    if (instrTitle) instrTitle.textContent = t('v.instructions');
    const ctaBtn = document.getElementById('whatsapp-btn');
    if (ctaBtn) ctaBtn.textContent = t('v.wa.cta');
  };
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.onclick = () => window.setLang(btn.dataset.lang);
  });
}

init();

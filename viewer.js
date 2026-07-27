// ============================================================
// Decode data from URL hash
// ============================================================
function decodeHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(hash);
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ============================================================
// Sanitize allowed HTML from the rich text editor
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

  // Avatar: first letters of name
  const initials = data.name
    .split(' ')
    .map(w => w[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
  document.getElementById('contact-avatar').textContent = initials;

  document.getElementById('contact-name').textContent = data.name;
  document.getElementById('contact-project').textContent = data.projectName || '';

  // Email
  if (data.email) {
    const row = document.getElementById('row-email');
    const link = document.getElementById('val-email');
    link.href = `mailto:${data.email}`;
    link.textContent = data.email;
    row.style.display = 'flex';
  }

  // WhatsApp — strip non-digits for the wa.me link
  if (data.whatsapp) {
    const row = document.getElementById('row-whatsapp');
    const link = document.getElementById('val-whatsapp');
    const digits = data.whatsapp.replace(/\D/g, '');
    link.href = `https://wa.me/${digits}`;
    link.textContent = `+${data.whatsapp.replace(/^\+/, '')}`;
    row.style.display = 'flex';

    // Prominent CTA button at the bottom
    const cta = document.getElementById('whatsapp-cta');
    const ctaBtn = document.getElementById('whatsapp-btn');
    ctaBtn.href = `https://wa.me/${digits}`;
    cta.style.display = 'block';
  }

  // Instructions — check if it has actual content
  const instructionsHtml = sanitize(data.instructions || '');
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = instructionsHtml;
  const hasInstructions = tempDiv.innerText.trim().length > 0;

  if (hasInstructions) {
    const row = document.getElementById('row-instructions');
    document.getElementById('val-instructions').innerHTML = instructionsHtml;
    row.style.display = 'block';
  }

  // Extra fields
  if (data.extraFields && data.extraFields.length > 0) {
    const container = document.getElementById('extra-fields-view');
    container.innerHTML = data.extraFields.map(f => `
      <div class="contact-row">
        <div class="contact-icon">📌</div>
        <div class="contact-info">
          <span class="contact-label">${esc(f.label)}</span>
          <span class="contact-value">${esc(f.value)}</span>
        </div>
      </div>
    `).join('');
  }
}

// ============================================================
// Init
// ============================================================
function init() {
  initLangSwitcher();

  const data = decodeHash();

  document.getElementById('loading').style.display = 'none';

  if (!data || !data.name) {
    document.getElementById('error-view').style.display = 'block';
    return;
  }

  document.getElementById('contact-card').style.display = 'block';
  render(data);

  // Re-render labels when lang changes (contact data stays, only labels update)
  const _orig = setLang;
  window.setLang = function(lang) {
    _orig(lang);
    // Re-apply viewer labels
    if (data.email) document.querySelector('#row-email .contact-label').textContent = t('v.email');
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

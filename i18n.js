// ============================================================
// Translations
// ============================================================
const translations = {
  es: {
    tagline:             'Crea un código QR para que te encuentren si pierdes algo',
    's1.title':          'Nuevo proyecto',
    's1.hint':           'Dale un nombre para identificar tu objeto (ej: MiMochila, LaptopTrabajo)',
    's1.label':          'Nombre del proyecto',
    's1.ph':             'Ej: MiMochila',
    's1.btn':            'Continuar →',
    's1.saved':          'Mis proyectos guardados',
    's2.title':          'Datos de contacto',
    's2.hint':           'Estos datos se mostrarán cuando alguien escanee tu QR',
    's2.name':           'Nombre',
    's2.name.ph':        'Tu nombre completo',
    's2.email':          'Email',
    's2.email.ph':       'tu@email.com',
    's2.wa':             'WhatsApp',
    's2.wa.ph':          '54 9 11 1234 5678',
    's2.instr':          'Instrucciones / Mensaje',
    's2.instr.ph':       'Escribe un mensaje para quien encuentre este objeto...',
    's2.addField':       '+ Agregar campo personalizado',
    's2.addField.ph':    'Nombre del campo (ej: Dirección, Teléfono fijo)',
    's2.addField.ok':    'Agregar',
    's2.addField.cancel':'Cancelar',
    's2.save':           '💾 Guardar y Generar QR',
    's3.saved':          '✓ Proyecto guardado',
    's3.title':          '¡Tu QR está listo!',
    's3.loading':        'Generando QR...',
    's3.scan':           'Escanéame para contactar',
    's3.print':          '🖨️ Imprimir',
    's3.copy':           '🔗 Copiar enlace',
    's3.copied':         '✓ ¡Copiado!',
    's3.urlLabel':       'Dato codificado en el QR:',
    's3.another':        '+ Crear otro QR',
    's3.viewAll':        'Ver mis proyectos',
    'mode.mini':         '📌 Mini',
    'mode.full':         '🔗 Completo',
    'mode.mini.desc':    'QR mínimo (21×21) — solo número. Apto para stickers de 1×1 cm.',
    'mode.full.desc':    'QR completo (25×25) — abre la tarjeta con todos tus datos.',
    'proj.view':         'Ver',
    'proj.qr':           'QR',
    'toolbar.bullet':    '• Lista',
    'toolbar.numbered':  '1. Lista',
    'err.empty':         'Por favor ingresa un nombre para el proyecto.',
    'err.exists':        'El nombre "<b>{n}</b>" ya existe. Por favor elige otro nombre.',
    'err.noname':        'Por favor ingresa tu nombre.',
    'del.confirm':       '¿Eliminar el proyecto "{n}"?\nEsta acción no se puede deshacer.',
    // viewer
    'v.loading':         'Cargando datos de contacto...',
    'v.email':           'Email',
    'v.whatsapp':        'WhatsApp',
    'v.instructions':    '📋 Instrucciones',
    'v.wa.cta':          '💬 Contactar por WhatsApp',
    'v.footer':          'Creado con',
    'v.err.title':       'No se pudieron cargar los datos',
    'v.err.msg':         'El enlace puede estar incompleto o dañado.',
  },
  en: {
    tagline:             'Create a QR code so people can reach you if you lose something',
    's1.title':          'New project',
    's1.hint':           'Give it a name to identify your object (e.g. MyBag, WorkLaptop)',
    's1.label':          'Project name',
    's1.ph':             'e.g. MyBag',
    's1.btn':            'Continue →',
    's1.saved':          'My saved projects',
    's2.title':          'Contact details',
    's2.hint':           'These details will be shown when someone scans your QR',
    's2.name':           'Name',
    's2.name.ph':        'Your full name',
    's2.email':          'Email',
    's2.email.ph':       'you@email.com',
    's2.wa':             'WhatsApp',
    's2.wa.ph':          '1 555 123 4567',
    's2.instr':          'Instructions / Message',
    's2.instr.ph':       'Write a message for whoever finds this object...',
    's2.addField':       '+ Add custom field',
    's2.addField.ph':    'Field name (e.g. Address, Home phone)',
    's2.addField.ok':    'Add',
    's2.addField.cancel':'Cancel',
    's2.save':           '💾 Save and Generate QR',
    's3.saved':          '✓ Project saved',
    's3.title':          'Your QR is ready!',
    's3.loading':        'Generating QR...',
    's3.scan':           'Scan me to get in touch',
    's3.print':          '🖨️ Print',
    's3.copy':           '🔗 Copy link',
    's3.copied':         '✓ Copied!',
    's3.urlLabel':       'Data encoded in QR:',
    's3.another':        '+ Create another QR',
    's3.viewAll':        'View my projects',
    'mode.mini':         '📌 Mini',
    'mode.full':         '🔗 Full',
    'mode.mini.desc':    'Minimal QR (21×21) — phone number only. Fits a 1×1 cm sticker.',
    'mode.full.desc':    'Full QR (25×25) — opens the card with all your details.',
    'proj.view':         'View',
    'proj.qr':           'QR',
    'toolbar.bullet':    '• List',
    'toolbar.numbered':  '1. List',
    'err.empty':         'Please enter a project name.',
    'err.exists':        'The name "<b>{n}</b>" already exists. Please choose another.',
    'err.noname':        'Please enter your name.',
    'del.confirm':       'Delete project "{n}"?\nThis action cannot be undone.',
    // viewer
    'v.loading':         'Loading contact details...',
    'v.email':           'Email',
    'v.whatsapp':        'WhatsApp',
    'v.instructions':    '📋 Instructions',
    'v.wa.cta':          '💬 Contact via WhatsApp',
    'v.footer':          'Created with',
    'v.err.title':       'Could not load data',
    'v.err.msg':         'The link may be incomplete or invalid.',
  },
  pt: {
    tagline:             'Crie um QR code para que te encontrem se perder algo',
    's1.title':          'Novo projeto',
    's1.hint':           'Dê um nome para identificar seu objeto (ex: MinhaMochila, Notebook)',
    's1.label':          'Nome do projeto',
    's1.ph':             'Ex: MinhaMochila',
    's1.btn':            'Continuar →',
    's1.saved':          'Meus projetos salvos',
    's2.title':          'Dados de contato',
    's2.hint':           'Esses dados serão exibidos quando alguém escanear seu QR',
    's2.name':           'Nome',
    's2.name.ph':        'Seu nome completo',
    's2.email':          'E-mail',
    's2.email.ph':       'voce@email.com',
    's2.wa':             'WhatsApp',
    's2.wa.ph':          '55 11 91234 5678',
    's2.instr':          'Instruções / Mensagem',
    's2.instr.ph':       'Escreva uma mensagem para quem encontrar este objeto...',
    's2.addField':       '+ Adicionar campo personalizado',
    's2.addField.ph':    'Nome do campo (ex: Endereço, Telefone fixo)',
    's2.addField.ok':    'Adicionar',
    's2.addField.cancel':'Cancelar',
    's2.save':           '💾 Salvar e Gerar QR',
    's3.saved':          '✓ Projeto salvo',
    's3.title':          'Seu QR está pronto!',
    's3.loading':        'Gerando QR...',
    's3.scan':           'Escaneie para entrar em contato',
    's3.print':          '🖨️ Imprimir',
    's3.copy':           '🔗 Copiar link',
    's3.copied':         '✓ Copiado!',
    's3.urlLabel':       'Dado codificado no QR:',
    's3.another':        '+ Criar outro QR',
    's3.viewAll':        'Ver meus projetos',
    'mode.mini':         '📌 Mini',
    'mode.full':         '🔗 Completo',
    'mode.mini.desc':    'QR mínimo (21×21) — só número. Ideal para adesivos de 1×1 cm.',
    'mode.full.desc':    'QR completo (25×25) — abre o cartão com todos os seus dados.',
    'proj.view':         'Ver',
    'proj.qr':           'QR',
    'toolbar.bullet':    '• Lista',
    'toolbar.numbered':  '1. Lista',
    'err.empty':         'Por favor insira um nome para o projeto.',
    'err.exists':        'O nome "<b>{n}</b>" já existe. Por favor escolha outro nome.',
    'err.noname':        'Por favor insira seu nome.',
    'del.confirm':       'Excluir o projeto "{n}"?\nEsta ação não pode ser desfeita.',
    // viewer
    'v.loading':         'Carregando dados de contato...',
    'v.email':           'E-mail',
    'v.whatsapp':        'WhatsApp',
    'v.instructions':    '📋 Instruções',
    'v.wa.cta':          '💬 Contatar pelo WhatsApp',
    'v.footer':          'Criado com',
    'v.err.title':       'Não foi possível carregar os dados',
    'v.err.msg':         'O link pode estar incompleto ou inválido.',
  },
};

// ============================================================
// Core
// ============================================================
const LANG_KEY = 'qr_lang';

let currentLang = (() => {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored && translations[stored]) return stored;
  const browser = (navigator.language || 'es').slice(0, 2);
  return translations[browser] ? browser : 'es';
})();

function t(key, vars = {}) {
  const map = translations[currentLang] || translations.es;
  const str = map[key] !== undefined ? map[key] : (translations.es[key] || key);
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] !== undefined ? vars[k] : '');
}

function setLang(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
  applyTranslations();
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll('[data-i18n-dp]').forEach(el => {
    el.dataset.placeholder = t(el.dataset.i18nDp);
  });
}

// Wire up lang buttons (called after DOM is ready)
function initLangSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
  document.documentElement.lang = currentLang;
  applyTranslations();
}

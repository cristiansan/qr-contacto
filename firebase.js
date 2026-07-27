// ============================================================
// Firebase Realtime Database integration
// ============================================================

(async () => {
  try {
    const { initializeApp } = await import(
      'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js'
    );
    const { getDatabase, ref, set, get, remove } = await import(
      'https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js'
    );

    const app = initializeApp({
      apiKey:            'AIzaSyA05_-YUxYK_iLIMnPgivkYDhxv7eOyHss',
      authDomain:        'poneqr-c0787.firebaseapp.com',
      projectId:         'poneqr-c0787',
      storageBucket:     'poneqr-c0787.firebasestorage.app',
      messagingSenderId: '840718664249',
      appId:             '1:840718664249:web:d49ec2641126d6fc3b03e8',
      databaseURL:       'https://poneqr-c0787-default-rtdb.firebaseio.com',
    });

    const db = getDatabase(app);

    window.fbSave = async (project) => {
      await set(ref(db, `projects/${project.id}`), project);
    };

    window.fbLoad = async () => {
      const snap = await get(ref(db, 'projects'));
      if (!snap.exists()) return [];
      return Object.values(snap.val());
    };

    window.fbDelete = async (id) => {
      await remove(ref(db, `projects/${id}`));
    };

    window.firebaseReady = true;
    document.dispatchEvent(new Event('firebase-ready'));
    console.info('[QR Contacto] Realtime Database conectado ✓');

  } catch (err) {
    console.warn('[QR Contacto] Firebase no disponible:', err.message);
  }
})();

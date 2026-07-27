// ============================================================
// Firebase / Firestore integration
// Dynamic import keeps this compatible with non-module scripts.
// Exposes window.fbSave, window.fbLoad, window.fbDelete.
// Falls back gracefully if offline or if rules block access.
// ============================================================

(async () => {
  try {
    const { initializeApp } = await import(
      'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js'
    );
    const {
      getFirestore, collection, doc,
      setDoc, getDocs, deleteDoc, serverTimestamp,
    } = await import(
      'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js'
    );

    const app = initializeApp({
      apiKey:            'AIzaSyA05_-YUxYK_iLIMnPgivkYDhxv7eOyHss',
      authDomain:        'poneqr-c0787.firebaseapp.com',
      projectId:         'poneqr-c0787',
      storageBucket:     'poneqr-c0787.firebasestorage.app',
      messagingSenderId: '840718664249',
      appId:             '1:840718664249:web:d49ec2641126d6fc3b03e8',
    });

    const db   = getFirestore(app);
    const COLL = 'projects';

    // Save or overwrite a project document
    window.fbSave = async (project) => {
      await setDoc(doc(db, COLL, project.id), {
        ...project,
        _ts: serverTimestamp(),   // server-side timestamp for ordering
      });
    };

    // Load all projects (strips the server timestamp before returning)
    window.fbLoad = async () => {
      const snap = await getDocs(collection(db, COLL));
      return snap.docs.map(d => {
        const { _ts, ...rest } = d.data();
        return rest;
      });
    };

    // Delete a project document
    window.fbDelete = async (id) => {
      await deleteDoc(doc(db, COLL, id));
    };

    window.firebaseReady = true;
    document.dispatchEvent(new Event('firebase-ready'));
    console.info('[QR Contacto] Firestore conectado ✓');

  } catch (err) {
    // App keeps working with localStorage only
    console.warn('[QR Contacto] Firebase no disponible:', err.message);
  }
})();

// ============================================================
// Firebase — Realtime Database + Authentication
// ============================================================

const ADMIN_EMAIL = 'cristiansan@gmail.com';

(async () => {
  try {
    const { initializeApp } = await import(
      'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js'
    );
    const { getDatabase, ref, set, get, remove } = await import(
      'https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js'
    );
    const {
      getAuth, onAuthStateChanged,
      signInWithPopup, GoogleAuthProvider,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      updateProfile,
      signOut: _signOut,
    } = await import(
      'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js'
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

    const db   = getDatabase(app);
    const auth = getAuth(app);

    // ── Projects ─────────────────────────────────────────────
    window.fbSave = async (project) =>
      set(ref(db, `projects/${project.id}`), project);

    window.fbLoad = async () => {
      const snap = await get(ref(db, 'projects'));
      return snap.exists() ? Object.values(snap.val()) : [];
    };

    window.fbLoadProject = async (id) => {
      const snap = await get(ref(db, `projects/${id}`));
      return snap.exists() ? snap.val() : null;
    };

    window.fbDelete = async (id) =>
      remove(ref(db, `projects/${id}`));

    // ── User profiles ─────────────────────────────────────────
    window.fbSaveProfile = async (uid, data) =>
      set(ref(db, `users/${uid}`), data);

    window.fbLoadProfile = async (uid) => {
      const snap = await get(ref(db, `users/${uid}`));
      return snap.exists() ? snap.val() : null;
    };

    // ── Auth ──────────────────────────────────────────────────
    window.fbSignInGoogle = () =>
      signInWithPopup(auth, new GoogleAuthProvider());

    window.fbSignInEmail = (email, pass) =>
      signInWithEmailAndPassword(auth, email, pass);

    window.fbRegisterEmail = async (email, pass, name) => {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) await updateProfile(cred.user, { displayName: name });
      return cred;
    };

    window.fbSignOut = () => _signOut(auth);

    window.fbIsAdmin = () =>
      window.currentUser?.email === ADMIN_EMAIL;

    // Auth state listener — fires immediately with current user
    onAuthStateChanged(auth, user => {
      window.currentUser = user || null;
      document.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
    });

    window.firebaseReady = true;
    document.dispatchEvent(new Event('firebase-ready'));
    console.info('[QR Contacto] Firebase conectado ✓');

  } catch (err) {
    console.warn('[QR Contacto] Firebase no disponible:', err.message);
  }
})();

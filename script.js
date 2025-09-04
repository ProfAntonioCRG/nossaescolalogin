// app.js (usar como <script type="module" src="app.js"></script>)

// ====== MENU RESPONSIVO ======
const hamburger = document.getElementById('hamburger');
const menu = document.querySelector('.menu');
if (hamburger) {
  hamburger.addEventListener('click', () => menu.classList.toggle('open'));
}

// ====== TROCA DE ABAS LOGIN/CADASTRO ======
const tabs = document.querySelectorAll('.tab');
const panes = document.querySelectorAll('.pane');
const toRegister = document.getElementById('toRegister');

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    panes.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

if (toRegister) {
  toRegister.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.tab[data-tab="register-pane"]').click();
  });
}

// ====== FIREBASE (CDN v9+ modular) ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDocs, collection, query, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 1) Cole aqui os dados do seu app (Project settings → Your apps → Web app)
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI.firebaseapp.com",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI.appspot.com",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI"
};

// 2) Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ====== ELEMENTOS ======
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authMsg = document.getElementById('authMsg');
const privateArea = document.getElementById('privateArea');
const welcomeUser = document.getElementById('welcomeUser');
const logoutBtn = document.getElementById('logoutBtn');

const showMsg = (text, type = "success") => {
  if (!authMsg) return;
  authMsg.textContent = text;
  authMsg.className = `msg ${type}`;
};

const clearMsg = () => showMsg("");

// ====== FUNÇÕES AUXILIARES FIRESTORE ======

// Verifica se "usuario" já existe
async function usernameExists(usuario) {
  const q = query(collection(db, "users"), where("usuario", "==", usuario));
  const snap = await getDocs(q);
  return !snap.empty;
}

// Recupera e-mail pelo "usuario" (para login com usuário)
async function emailFromUsername(usuario) {
  const q = query(collection(db, "users"), where("usuario", "==", usuario));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docData = snap.docs[0].data();
  return docData?.email ?? null;
}

// ====== CADASTRO ======
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg();

    const nome = document.getElementById('regNome').value.trim();
    const dataNascimento = document.getElementById('regNascimento').value;
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const telefone = document.getElementById('regTelefone').value.trim();
    const usuario = document.getElementById('regUsuario').value.trim().toLowerCase();
    const senha = document.getElementById('regSenha').value;

    try {
      // 1) Garante usuário único
      if (await usernameExists(usuario)) {
        showMsg("Este usuário já está em uso. Tente outro.", "error");
        return;
      }

      // 2) Cria conta no Auth
      const cred = await createUserWithEmailAndPassword(auth, email, senha);

      // 3) Atualiza displayName (opcional)
      await updateProfile(cred.user, { displayName: usuario });

      // 4) Salva perfil no Firestore (doc = uid)
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        nome,
        dataNascimento,
        email,
        telefone,
        usuario,               // login público
        createdAt: serverTimestamp()
      });

      showMsg("Conta criada com sucesso! Você já está logado.", "success");
      registerForm.reset();
      document.querySelector('.tab[data-tab="login-pane"]').click(); // volta à aba login

    } catch (err) {
      console.error(err);
      // Mensagens comuns do Firebase
      if (err.code === "auth/weak-password") showMsg("Senha muito fraca (mín. 6).", "error");
      else if (err.code === "auth/email-already-in-use") showMsg("E-mail já em uso.", "error");
      else showMsg("Erro ao cadastrar. Verifique os dados e tente novamente.", "error");
    }
  });
}

// ====== LOGIN ======
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg();

    let userOrEmail = document.getElementById('loginUser').value.trim().toLowerCase();
    const pass = document.getElementById('loginPass').value;

    try {
      // Se não digitou e-mail (sem @), busca o e-mail pelo "usuario"
      if (!userOrEmail.includes('@')) {
        const email = await emailFromUsername(userOrEmail);
        if (!email) {
          showMsg("Usuário não encontrado.", "error");
          return;
        }
        userOrEmail = email;
      }

      await signInWithEmailAndPassword(auth, userOrEmail, pass);
      showMsg("Login realizado com sucesso!", "success");
      loginForm.reset();
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        showMsg("Credenciais inválidas. Confira usuário/e-mail e senha.", "error");
      } else if (err.code === "auth/user-not-found") {
        showMsg("Usuário não encontrado.", "error");
      } else {
        showMsg("Erro ao entrar. Tente novamente.", "error");
      }
    }
  });
}

// ====== ESTADO DE AUTENTICAÇÃO ======
onAuthStateChanged(auth, async (user) => {
  if (user) {
    privateArea.classList.remove('hidden');
    welcomeUser.textContent = `Bem-vindo, ${user.displayName || user.email}!`;
  } else {
    privateArea.classList.add('hidden');
  }
});

// ====== LOGOUT ======
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    showMsg("Você saiu da conta.", "success");
  });
}


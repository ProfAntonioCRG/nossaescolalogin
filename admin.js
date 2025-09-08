// admin.js

// ===== CONFIG SUPABASE =====
const SUPABASE_URL = "https://SEU_PROJECT_REF.supabase.co";
const SUPABASE_ANON_KEY = "SUA_ANON_KEY";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== ELEMENTOS =====
const tableBody = document.querySelector("#usersTable tbody");
const editFormContainer = document.getElementById("editFormContainer");
const editForm = document.getElementById("editForm");
const cancelEditBtn = document.getElementById("cancelEdit");
const msg = document.getElementById("msg");

// ===== FUNÇÕES =====

// Carregar todos os perfis
async function loadProfiles() {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    showMsg("Erro ao carregar usuários", "error");
    return;
  }

  tableBody.innerHTML = "";
  data.forEach(user => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.full_name || ""}</td>
      <td>${user.dob || ""}</td>
      <td>${user.email || ""}</td>
      <td>${user.phone || ""}</td>
      <td>${user.username || ""}</td>
      <td>
        <button onclick="editUser('${user.id}')">Editar</button>
        <button onclick="deleteUser('${user.id}')">Excluir</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// Mostrar mensagem
function showMsg(text, type = "success") {
  msg.textContent = text;
  msg.className = `msg ${type}`;
}

// Editar usuário
window.editUser = async (id) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (error) {
    console.error(error);
    return;
  }
  document.getElementById("editId").value = data.id;
  document.getElementById("editNome").value = data.full_name || "";
  document.getElementById("editNascimento").value = data.dob || "";
  document.getElementById("editEmail").value = data.email || "";
  document.getElementById("editTelefone").value = data.phone || "";
  document.getElementById("editUsuario").value = data.username || "";
  editFormContainer.classList.remove("hidden");
};

// Salvar alterações
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const full_name = document.getElementById("editNome").value.trim();
  const dob = document.getElementById("editNascimento").value;
  const email = document.getElementById("editEmail").value.trim();
  const phone = document.getElementById("editTelefone").value.trim();
  const username = document.getElementById("editUsuario").value.trim();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, dob, email, phone, username })
    .eq("id", id);

  if (error) {
    console.error(error);
    showMsg("Erro ao atualizar usuário", "error");
  } else {
    showMsg("Usuário atualizado com sucesso!");
    editForm.reset();
    editFormContainer.classList.add("hidden");
    loadProfiles();
  }
});

// Cancelar edição
cancelEditBtn.addEventListener("click", () => {
  editForm.reset();
  editFormContainer.classList.add("hidden");
});

// Excluir usuário
window.deleteUser = async (id) => {
  if (!confirm("Deseja excluir este usuário?")) return;
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) {
    console.error(error);
    showMsg("Erro ao excluir usuário", "error");
  } else {
    showMsg("Usuário excluído com sucesso!");
    loadProfiles();
  }
};

// Inicializar
loadProfiles();

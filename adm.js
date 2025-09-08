// ===== LOGOUT =====
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    alert("Você saiu da conta.");
    window.location.href = "login.html";
  });
}
(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("Você precisa fazer login.");
    window.location.href = "login.html";
    return;
  }

  if (user.email !== "profeantonio") {
    alert("Acesso negado. Somente admin pode entrar.");
    window.location.href = "index.html";
    return;
  }
})();


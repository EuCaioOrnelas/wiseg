document.addEventListener("DOMContentLoaded", function () {
  const username = "Wiseguros";
  const password = "Wiseg1357&";

  function login() {
    const inputUsername = document.getElementById("username").value;
    const inputPassword = document.getElementById("password").value;
    const errorMessage = document.getElementById("error");

    if (inputUsername === username && inputPassword === password) {
      sessionStorage.setItem("loggedIn", "true");
      window.location.href = "home.html"; // Redireciona para a página principal após login
    } else {
      errorMessage.textContent = "Usuário ou senha incorretos!";
    }
  }

  // Verificar se o botão de login está sendo associado corretamente
  const loginButton = document.getElementById("login-button");
  if (loginButton) {
    loginButton.addEventListener("click", login); // Associa o evento de clique ao botão
  } else {
    console.error("Botão de login não encontrado");
  }

  // Exemplo de link de criar conta Wiisec (editar depois)
  document
    .getElementById("create-account-link")
    .addEventListener("click", function () {
      alert("Página de criação de conta ainda não configurada!");
    });
});

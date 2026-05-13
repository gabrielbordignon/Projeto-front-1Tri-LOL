// ── Usuários cadastrados ──────────────────────────────────────
var usuarios = [
    { nome: "Ana Silva",    email: "ana@email.com",          senha: "123456",  tipo: "cliente"      },
    { nome: "Bruno Costa",  email: "bruno@email.com",        senha: "123456",  tipo: "cliente"      },
    { nome: "Funcionario",  email: "func@lavanderia.com",    senha: "admin123",tipo: "funcionario"  }
];

// ── Botão de login ────────────────────────────────────────────
document.getElementById('botao').addEventListener('click', function () {
    var email = document.getElementById('Usuario').value.trim();
    var senha = document.getElementById('password').value;
    var erro  = document.getElementById('erro-login');

    erro.style.display = 'none';

    if (!email || !senha) {
        erro.textContent = 'Preencha o e-mail e a senha.';
        erro.style.display = 'block';
        return;
    }

    // Junta usuários fixos com os cadastrados dinamicamente
    var cadastrados = JSON.parse(localStorage.getItem('usuariosCadastrados') || '[]');
    var todosUsuarios = usuarios.concat(cadastrados);

    var usuario = null;
    for (var i = 0; i < todosUsuarios.length; i++) {
        if (todosUsuarios[i].email === email && todosUsuarios[i].senha === senha) {
            usuario = todosUsuarios[i];
            break;
        }
    }

    if (!usuario) {
        erro.textContent = 'E-mail ou senha incorretos.';
        erro.style.display = 'block';
        return;
    }

    // Salva sessão
    sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));

    // Redireciona conforme tipo
    if (usuario.tipo === 'funcionario') {
        window.location.href = '../Pagina_Funcionarios/Pagina_Funcionario.html';
    } else {
        window.location.href = '../Pagina_clientes/Pagina_Cliente.html';
    }
});

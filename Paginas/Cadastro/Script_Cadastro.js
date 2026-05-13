document.getElementById('btn-cadastrar').addEventListener('click', function () {
    var nome      = document.getElementById('inp-nome').value.trim();
    var sobrenome = document.getElementById('inp-sobrenome').value.trim();
    var cpf       = document.getElementById('inp-cpf').value.trim();
    var email     = document.getElementById('inp-email').value.trim();
    var endereco  = document.getElementById('inp-endereco').value.trim();
    var telefone  = document.getElementById('inp-telefone').value.trim();
    var senha     = document.getElementById('inp-senha').value.trim();
    var erro      = document.getElementById('erro-cadastro');

    erro.style.display = 'none';

    if (!nome || !sobrenome || !cpf || !email || !endereco || !telefone || !senha) {
        erro.textContent = 'Preencha todos os campos.';
        erro.style.display = 'block';
        return;
    }

    if (senha.length < 6) {
        erro.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        erro.style.display = 'block';
        return;
    }

    // Recupera usuários já cadastrados (ou começa lista vazia)
    var usuariosSalvos = JSON.parse(localStorage.getItem('usuariosCadastrados') || '[]');

    // Verifica e-mail duplicado
    for (var i = 0; i < usuariosSalvos.length; i++) {
        if (usuariosSalvos[i].email === email) {
            erro.textContent = 'Este e-mail já está cadastrado.';
            erro.style.display = 'block';
            return;
        }
    }

    var novoUsuario = {
        nome: nome + ' ' + sobrenome,
        email: email,
        senha: senha,
        cpf: cpf,
        endereco: endereco,
        telefone: telefone,
        tipo: 'cliente'
    };

    usuariosSalvos.push(novoUsuario);
    localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosSalvos));

    alert('Cadastro realizado com sucesso! Faça login para continuar.');
    window.location.href = '../Login/pagina_login.html';
});

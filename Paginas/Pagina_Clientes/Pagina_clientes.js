document.getElementById('btnAdicionar').addEventListener('click', function() {
            const container = document.getElementById('container-pecas');
            
            // Seleciona a primeira linha para servir de modelo para o clone
            const primeiraLinha = container.querySelector('.peca-item');
            const novaLinha = primeiraLinha.cloneNode(true);
            
            // Limpa os campos da nova linha
            novaLinha.querySelectorAll('input').forEach(input => input.value = '');
            novaLinha.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
            
            // Mostra o botão "Remover" apenas na nova linha
            const btnRemover = novaLinha.querySelector('.btn-remover');
            btnRemover.style.display = 'block';

            container.appendChild(novaLinha);
        });

        function removerLinha(botao) {
            // Remove a linha pai do botão clicado
            botao.closest('.peca-item').remove();
        }
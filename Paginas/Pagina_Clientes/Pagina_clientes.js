// ── Tabela de preços por peça ──────────────────────────────────
var precos = {
    'Calça':    12.00,
    'Camiseta':  6.00,
    'Camisa':    9.00,
    'Vestido':  15.00,
    'Toalha':    5.00,
    'Cobertor': 20.00,
    'Shorts':    7.00,
    'Blusa':     8.00,
    'Jaqueta':  18.00
};

// ── Dados do cliente logado ────────────────────────────────────
var usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
var chaveCliente  = 'pedidos_' + (usuarioLogado ? usuarioLogado.email : 'anonimo');
var chaveFunc     = 'pedidos_funcionario';

var pedidosExemplo = [
    { id: 1023, cliente: (usuarioLogado ? usuarioLogado.nome : 'Cliente'), data: '24/04/2025 - 14:30', pecas: '3 Camisas, 2 Calças, 1 Vestido', itens: [{peca:'Camisa',qtd:3},{peca:'Calça',qtd:2},{peca:'Vestido',qtd:1}], valor: 'R$ 69,00', status: 'ABERTO'    },
    { id: 1018, cliente: (usuarioLogado ? usuarioLogado.nome : 'Cliente'), data: '20/04/2025',          pecas: '5 Toalhas, 1 Cobertor',           itens: [{peca:'Toalha',qtd:5},{peca:'Cobertor',qtd:1}],               valor: 'R$ 45,00', status: 'PRONTO'    },
    { id: 1009, cliente: (usuarioLogado ? usuarioLogado.nome : 'Cliente'), data: '15/04/2025',          pecas: '4 Camisetas, 3 Shorts',           itens: [{peca:'Camiseta',qtd:4},{peca:'Shorts',qtd:3}],               valor: 'R$ 45,00', status: 'PROCESSO'  },
    { id: 1002, cliente: (usuarioLogado ? usuarioLogado.nome : 'Cliente'), data: '10/04/2025',          pecas: '2 Blusas, 1 Jaqueta',             itens: [{peca:'Blusa',qtd:2},{peca:'Jaqueta',qtd:1}],                 valor: 'R$ 34,00', status: 'CANCELADO' }
];

function carregarPedidos() {
    var salvo = localStorage.getItem(chaveCliente);
    if (salvo) return JSON.parse(salvo);
    localStorage.setItem(chaveCliente, JSON.stringify(pedidosExemplo));
    sincronizarComFuncionario(pedidosExemplo);
    return pedidosExemplo;
}

function salvarPedidos(pedidos) {
    localStorage.setItem(chaveCliente, JSON.stringify(pedidos));
    sincronizarComFuncionario(pedidos);
}

function sincronizarComFuncionario(pedidosCliente) {
    var nomeCliente = usuarioLogado ? usuarioLogado.nome : 'Cliente';
    var todosPedidos = JSON.parse(localStorage.getItem(chaveFunc) || '[]');
    todosPedidos = todosPedidos.filter(function(p) { return p.cliente !== nomeCliente; });
    pedidosCliente.forEach(function(p) {
        todosPedidos.push(Object.assign({}, p, { cliente: nomeCliente }));
    });
    todosPedidos.sort(function(a, b) { return b.id - a.id; });
    localStorage.setItem(chaveFunc, JSON.stringify(todosPedidos));
}

function verificarAtualizacoesFunc() {
    var todosPedidos = JSON.parse(localStorage.getItem(chaveFunc) || '[]');
    var pedidosCliente = JSON.parse(localStorage.getItem(chaveCliente) || '[]');
    var atualizado = false;

    pedidosCliente.forEach(function(pc) {
        var pf = null;
        for (var i = 0; i < todosPedidos.length; i++) {
            if (todosPedidos[i].id === pc.id) { pf = todosPedidos[i]; break; }
        }
        if (pf && pf.status !== pc.status) {
            pc.status = pf.status;
            atualizado = true;
        }
    });

    if (atualizado) {
        localStorage.setItem(chaveCliente, JSON.stringify(pedidosCliente));
        renderizarPedidos('todos');
    }
}

function calcularValor(itens) {
    var total = 0;
    itens.forEach(function(item) { total += (precos[item.peca] || 0) * item.qtd; });
    return 'R$ ' + total.toFixed(2).replace('.', ',');
}

// ── Renderização ───────────────────────────────────────────────
function renderizarPedidos(filtro) {
    var pedidos = carregarPedidos();
    var container = document.getElementById('Pedidos');
    container.innerHTML = '';

    var filtrados = pedidos.filter(function (p) {
        if (!filtro || filtro === 'todos') return true;
        if (filtro === 'processo') return p.status === 'PROCESSO' || p.status === 'RECOLHIDO' || p.status === 'PAGO';
        return p.status === filtro;
    });

    if (filtrados.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:30px;color:#aaa;">Nenhum pedido encontrado.</p>';
        atualizarResumo(pedidos);
        return;
    }

    filtrados.forEach(function (p) { container.appendChild(criarCardPedido(p)); });
    atualizarResumo(pedidos);
}

function criarCardPedido(p) {
    var statusClass = { ABERTO:'aberto', PROCESSO:'processo', RECOLHIDO:'processo', PAGO:'processo', PRONTO:'pronto', FINALIZADO:'pronto', CANCELADO:'cancelado' };
    var statusLabel = { ABERTO:'ABERTO', PROCESSO:'EM PROCESSO', RECOLHIDO:'RECOLHIDO', PAGO:'PAGO', PRONTO:'PRONTO', FINALIZADO:'FINALIZADO', CANCELADO:'CANCELADO' };
    var div = document.createElement('div');
    div.className = 'pedido';
    div.dataset.id = p.id;
    var botaoCancelar = '';
    if (p.status === 'ABERTO') {
        botaoCancelar = '<button class="btn btn-cancelar" onclick="cancelarPedido(' + p.id + ')">Cancelar</button>';
    }
    div.innerHTML =
        '<div class="info">' +
            '<div class="numero"> Pedido #' + p.id +
                ' <span class="status ' + (statusClass[p.status]||'') + '">' + (statusLabel[p.status]||p.status) + '</span>' +
            '</div>' +
            '<div class="data"> ' + p.data + ' </div>' +
            '<div class="pecas"> ' + p.pecas + ' </div>' +
        '</div>' +
        '<div class="direita">' +
            '<div class="valor"> ' + p.valor + ' </div>' +
            '<button class="btn btn-detalhes" onclick="abrirDetalhes(' + p.id + ')">Ver Detalhes</button>' +
            botaoCancelar +
        '</div>';
    return div;
}

// ── Modal Detalhes ─────────────────────────────────────────────
function abrirDetalhes(id) {
    var pedidos = carregarPedidos();
    var p = null;
    for (var i = 0; i < pedidos.length; i++) { if (pedidos[i].id === id) { p = pedidos[i]; break; } }
    if (!p) return;

    var statusLabel = { ABERTO:'ABERTO', PROCESSO:'EM PROCESSO', RECOLHIDO:'RECOLHIDO', PAGO:'PAGO', PRONTO:'PRONTO', FINALIZADO:'FINALIZADO', CANCELADO:'CANCELADO' };
    var statusClass = { ABERTO:'aberto', PROCESSO:'processo', RECOLHIDO:'processo', PAGO:'processo', PRONTO:'pronto', FINALIZADO:'pronto', CANCELADO:'cancelado' };

    var itensHtml = '';
    if (p.itens && p.itens.length > 0) {
        itensHtml = '<table style="width:100%;border-collapse:collapse;margin:12px 0;">' +
            '<thead><tr style="background:#f0f4ff;">' +
            '<th style="padding:8px 12px;text-align:left;font-size:13px;color:#555;">Peça</th>' +
            '<th style="padding:8px 12px;text-align:center;font-size:13px;color:#555;">Qtd.</th>' +
            '<th style="padding:8px 12px;text-align:right;font-size:13px;color:#555;">Preço Unit.</th>' +
            '<th style="padding:8px 12px;text-align:right;font-size:13px;color:#555;">Subtotal</th>' +
            '</tr></thead><tbody>';
        p.itens.forEach(function(item) {
            var preco = precos[item.peca] || 0;
            var sub = (preco * item.qtd).toFixed(2).replace('.',',');
            itensHtml += '<tr style="border-bottom:1px solid #eee;">' +
                '<td style="padding:8px 12px;">' + item.peca + '</td>' +
                '<td style="padding:8px 12px;text-align:center;">' + item.qtd + '</td>' +
                '<td style="padding:8px 12px;text-align:right;">R$ ' + preco.toFixed(2).replace('.',',') + '</td>' +
                '<td style="padding:8px 12px;text-align:right;font-weight:bold;">R$ ' + sub + '</td>' +
                '</tr>';
        });
        itensHtml += '</tbody></table>';
    } else {
        itensHtml = '<p style="color:#888;font-size:13px;">' + p.pecas + '</p>';
    }

    document.getElementById('det-numero').textContent = 'Pedido #' + p.id;
    document.getElementById('det-status').innerHTML = '<span class="status ' + (statusClass[p.status]||'') + '">' + (statusLabel[p.status]||p.status) + '</span>';
    document.getElementById('det-data').textContent = p.data;
    document.getElementById('det-itens').innerHTML = itensHtml;
    document.getElementById('det-total').textContent = p.valor;

    var modalEl = document.getElementById('modalDetalhes');
    var modal = new bootstrap.Modal(modalEl);
    modal.show();
}

// ── Filtros ────────────────────────────────────────────────────
function filtrarPedidos(filtro) { renderizarPedidos(filtro); }

// ── Cancelar pedido ────────────────────────────────────────────
function cancelarPedido(id) {
    if (!confirm('Deseja cancelar o pedido #' + id + '?')) return;
    var pedidos = carregarPedidos();
    pedidos.forEach(function (p) { if (p.id === id) p.status = 'CANCELADO'; });
    salvarPedidos(pedidos);
    renderizarPedidos('todos');
}

function cancelarPrimeiroPedidoAberto() {
    var pedidos = carregarPedidos();
    var aberto = null;
    for (var i = 0; i < pedidos.length; i++) { if (pedidos[i].status === 'ABERTO') { aberto = pedidos[i]; break; } }
    if (!aberto) { alert('Você não tem pedidos abertos.'); return; }
    cancelarPedido(aberto.id);
}

// ── Resumo lateral ─────────────────────────────────────────────
function atualizarResumo(pedidos) {
    if (!pedidos) pedidos = carregarPedidos();
    document.getElementById('res-total').textContent     = pedidos.length;
    document.getElementById('res-abertos').textContent   = pedidos.filter(function(p){ return p.status==='ABERTO'; }).length;
    document.getElementById('res-cancelados').textContent= pedidos.filter(function(p){ return p.status==='CANCELADO'; }).length;
}

// ── Modal novo pedido: adicionar/remover linha ─────────────────
document.getElementById('btnAdicionar').addEventListener('click', function () {
    var container = document.getElementById('container-pecas');
    var primeiraLinha = container.querySelector('.peca-item');
    var novaLinha = primeiraLinha.cloneNode(true);
    novaLinha.querySelectorAll('input').forEach(function(i){ i.value=''; });
    novaLinha.querySelectorAll('select').forEach(function(s){ s.selectedIndex=0; });
    novaLinha.querySelector('.btn-remover').style.display = 'block';
    container.appendChild(novaLinha);
});

function removerLinha(botao) { botao.closest('.peca-item').remove(); }

// ── Confirmar pedido ───────────────────────────────────────────
function confirmarPedido() {
    var linhas = document.querySelectorAll('.peca-item');
    var pecasList = [], itensList = [], valido = true;

    linhas.forEach(function (linha) {
        var select = linha.querySelector('select');
        var input  = linha.querySelector('input[type="number"]');
        var peca   = select ? select.value : '';
        var qtd    = input  ? parseInt(input.value) : 0;
        if (!peca || !qtd || qtd < 1) { valido = false; return; }
        pecasList.push(qtd + ' ' + peca + (qtd > 1 ? 's' : ''));
        itensList.push({ peca: peca, qtd: qtd });
    });

    if (!valido || pecasList.length === 0) {
        alert('Preencha todas as peças e quantidades antes de confirmar.');
        return;
    }

    var pedidos = carregarPedidos();
    var maiorId = 1000;
    pedidos.forEach(function(p){ if (p.id > maiorId) maiorId = p.id; });

    var agora = new Date();
    var data  = agora.toLocaleDateString('pt-BR') + ' - ' + agora.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});

    var novoPedido = {
        id:      maiorId + 1,
        cliente: usuarioLogado ? usuarioLogado.nome : 'Cliente',
        data:    data,
        pecas:   pecasList.join(', '),
        itens:   itensList,
        valor:   calcularValor(itensList),
        status:  'ABERTO'
    };

    pedidos.unshift(novoPedido);
    salvarPedidos(pedidos);

    var modalEl = document.getElementById('modalPedido');
    var modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    var container = document.getElementById('container-pecas');
    container.querySelectorAll('.peca-item').forEach(function(l, i){ if (i > 0) l.remove(); });
    var primeira = container.querySelector('.peca-item');
    if (primeira) {
        primeira.querySelectorAll('input').forEach(function(i){ i.value=''; });
        primeira.querySelector('select').selectedIndex = 0;
    }

    renderizarPedidos('todos');
}

// ── Sync tempo real ────────────────────────────────────────────
window.addEventListener('storage', function(e) {
    if (e.key === chaveFunc) verificarAtualizacoesFunc();
});
setInterval(verificarAtualizacoesFunc, 3000);

// ── Init ───────────────────────────────────────────────────────
sincronizarComFuncionario(carregarPedidos());
renderizarPedidos('todos');

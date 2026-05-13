// ── Chave compartilhada com os clientes ───────────────────────
var chaveFunc = 'pedidos_funcionario';

var pedidosExemplo = [
    { id: 1023, cliente: 'Ana Silva',    data: '24/04/2025 - 14:30', pecas: '3 Camisas, 2 Calças, 1 Vestido', itens: [{peca:'Camisa',qtd:3},{peca:'Calça',qtd:2},{peca:'Vestido',qtd:1}], valor: 'R$ 69,00', status: 'ABERTO'    },
    { id: 1018, cliente: 'Ana Silva',    data: '20/04/2025',          pecas: '5 Toalhas, 1 Cobertor',           itens: [{peca:'Toalha',qtd:5},{peca:'Cobertor',qtd:1}],               valor: 'R$ 45,00', status: 'PAGO'      },
    { id: 1009, cliente: 'Bruno Costa',  data: '15/04/2025',          pecas: '4 Camisetas, 3 Shorts',           itens: [{peca:'Camiseta',qtd:4},{peca:'Shorts',qtd:3}],               valor: 'R$ 45,00', status: 'RECOLHIDO' },
    { id: 1002, cliente: 'Bruno Costa',  data: '10/04/2025',          pecas: '2 Blusas, 1 Jaqueta',             itens: [{peca:'Blusa',qtd:2},{peca:'Jaqueta',qtd:1}],                 valor: 'R$ 34,00', status: 'CANCELADO' },
    { id: 1001, cliente: 'Carla Mendes', data: '05/04/2025',          pecas: '1 Cobertor, 3 Toalhas',           itens: [{peca:'Cobertor',qtd:1},{peca:'Toalha',qtd:3}],               valor: 'R$ 35,00', status: 'FINALIZADO'}
];

function carregarPedidos() {
    var salvo = localStorage.getItem(chaveFunc);
    if (salvo) return JSON.parse(salvo);
    localStorage.setItem(chaveFunc, JSON.stringify(pedidosExemplo));
    return pedidosExemplo;
}

function salvarPedidos(pedidos) {
    localStorage.setItem(chaveFunc, JSON.stringify(pedidos));
    // Propaga atualização de status para a chave do cliente
    propagarParaCliente(pedidos);
}

// Atualiza o localStorage de cada cliente com o novo status
function propagarParaCliente(pedidos) {
    var clientesVistos = {};
    pedidos.forEach(function(p) {
        if (!clientesVistos[p.cliente]) clientesVistos[p.cliente] = [];
        clientesVistos[p.cliente].push(p);
    });
    // Para cada chave de pedidos de cliente existente no localStorage, atualiza status
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf('pedidos_') === 0 && key !== chaveFunc) {
            try {
                var clientePedidos = JSON.parse(localStorage.getItem(key) || '[]');
                var atualizado = false;
                clientePedidos.forEach(function(cp) {
                    var pFunc = null;
                    for (var j = 0; j < pedidos.length; j++) {
                        if (pedidos[j].id === cp.id) { pFunc = pedidos[j]; break; }
                    }
                    if (pFunc && pFunc.status !== cp.status) {
                        cp.status = pFunc.status;
                        atualizado = true;
                    }
                });
                if (atualizado) localStorage.setItem(key, JSON.stringify(clientePedidos));
            } catch(e) {}
        }
    }
}

// ── RF007 — sequência obrigatória ─────────────────────────────
var proximoStatus = {
    'ABERTO':    'RECOLHIDO',
    'RECOLHIDO': 'PAGO',
    'PAGO':      'FINALIZADO'
};

function avancarStatus(id) {
    var pedidos = carregarPedidos();
    pedidos.forEach(function (p) {
        if (p.id === id && proximoStatus[p.status]) p.status = proximoStatus[p.status];
    });
    salvarPedidos(pedidos);
    renderizarPedidos('todos');
}

// ── Renderização ───────────────────────────────────────────────
function renderizarPedidos(filtro) {
    var pedidos = carregarPedidos();
    var container = document.getElementById('Pedidos');
    container.innerHTML = '';

    var filtrados = pedidos.filter(function (p) {
        if (!filtro || filtro === 'todos') return true;
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
    var statusClass = { ABERTO:'aberto', RECOLHIDO:'processo', PAGO:'processo', FINALIZADO:'pronto', CANCELADO:'cancelado' };
    var statusLabel = { ABERTO:'ABERTO', RECOLHIDO:'RECOLHIDO', PAGO:'PAGO', FINALIZADO:'FINALIZADO', CANCELADO:'CANCELADO' };

    var div = document.createElement('div');
    div.className = 'pedido';

    var botaoAvancar = '';
    if (proximoStatus[p.status]) {
        botaoAvancar =
            '<button class="btn btn-avancar" onclick="avancarStatus(' + p.id + ')">' +
                'Avançar → ' + proximoStatus[p.status] +
            '</button>';
    }

    div.innerHTML =
        '<div class="info">' +
            '<div class="numero"> Pedido #' + p.id +
                ' <span class="status ' + (statusClass[p.status]||'') + '">' + (statusLabel[p.status]||p.status) + '</span>' +
            '</div>' +
            '<div class="data"> ' + p.data + ' </div>' +
            '<div class="pecas"> ' + p.pecas + ' </div>' +
            '<div class="cliente-label">Cliente: <strong>' + p.cliente + '</strong></div>' +
        '</div>' +
        '<div class="direita">' +
            '<div class="valor"> ' + p.valor + ' </div>' +
            '<button class="btn btn-detalhes" onclick="abrirDetalhes(' + p.id + ')">Ver Detalhes</button>' +
            botaoAvancar +
        '</div>';

    return div;
}

// ── Modal Detalhes ─────────────────────────────────────────────
var precos = { 'Calça':12,'Camiseta':6,'Camisa':9,'Vestido':15,'Toalha':5,'Cobertor':20,'Shorts':7,'Blusa':8,'Jaqueta':18 };

function abrirDetalhes(id) {
    var pedidos = carregarPedidos();
    var p = null;
    for (var i = 0; i < pedidos.length; i++) { if (pedidos[i].id === id) { p = pedidos[i]; break; } }
    if (!p) return;

    var statusLabel = { ABERTO:'ABERTO', RECOLHIDO:'RECOLHIDO', PAGO:'PAGO', FINALIZADO:'FINALIZADO', CANCELADO:'CANCELADO' };
    var statusClass = { ABERTO:'aberto', RECOLHIDO:'processo', PAGO:'processo', FINALIZADO:'pronto', CANCELADO:'cancelado' };

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
    document.getElementById('det-cliente').textContent = p.cliente;
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

// ── Resumo ─────────────────────────────────────────────────────
function atualizarResumo(pedidos) {
    if (!pedidos) pedidos = carregarPedidos();
    document.getElementById('res-total').textContent      = pedidos.length;
    document.getElementById('res-abertos').textContent    = pedidos.filter(function(p){ return p.status==='ABERTO';     }).length;
    document.getElementById('res-recolhidos').textContent = pedidos.filter(function(p){ return p.status==='RECOLHIDO';  }).length;
    document.getElementById('res-pagos').textContent      = pedidos.filter(function(p){ return p.status==='PAGO';       }).length;
    document.getElementById('res-finalizados').textContent= pedidos.filter(function(p){ return p.status==='FINALIZADO'; }).length;
    document.getElementById('res-cancelados').textContent = pedidos.filter(function(p){ return p.status==='CANCELADO';  }).length;
}

// ── Sair ───────────────────────────────────────────────────────
function sair() {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = '../Login/pagina_login.html';
}

// ── Sync tempo real ────────────────────────────────────────────
window.addEventListener('storage', function(e) {
    if (e.key === chaveFunc) renderizarPedidos('todos');
});
setInterval(function() { renderizarPedidos('todos'); }, 3000);

// ── Init ───────────────────────────────────────────────────────
renderizarPedidos('todos');

function toggle(el, Resumo, Pedidos) {
    var display2 = document.getElementById(Resumo).style.display
    var display3 = document.getElementById(Pedidos).style.display
    var display = document.getElementById(el).style.display
    if (display == 'none' && display2 == 'flex' && display3 == 'flex') {
        document.getElementById(Resumo).style.display = 'none';
        document.getElementById(Pedidos).style.display = 'none';
        document.getElementById(el).style.display = 'flex';
    }
    else if ( display == "flex" && display2 == 'none' && display3 == 'none') {
        document.getElementById(Resumo).style.display = 'flex';
        document.getElementById(Pedidos).style.display = 'flex';
        document.getElementById(el).style.display = 'none';
    }
} 
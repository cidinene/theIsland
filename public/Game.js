// Canvas y contexto del Canvas
var canvas = document.getElementById("canvas");
var contexto = canvas.getContext("2d");
var escaladoMinimo = 1;

// Controles
var controles = {};


// Capas
var layer;
var gameLayer;
var menuLayer;

var tiempoEstandarMovimiento = 30000;
var tiempoBonificacionPregunta = 15000;
var portSocket = 3030;

// Inicio capas y bucle del juego
function iniciarJuego() {
    gameLayer = new GameLayer();
    layer = gameLayer;

    setInterval(loop, 1000 / 30);
}


function loop(){
    if (!enCanvas){
        return true; //para que no funcione si no se está viendo el canvas
    }

    layer.actualizar();
    if (entrada == entradas.pulsaciones) {
        layer.calcularPulsaciones(pulsaciones);
    }
    layer.procesarControles()
    layer.dibujar();

    actualizarPulsaciones();
}

function actualizarPulsaciones () {
    for(var i=0; i < pulsaciones.length; i++){
        if ( pulsaciones[i].tipo ==  tipoPulsacion.inicio){
            pulsaciones[i].tipo = tipoPulsacion.mantener;
        }
    }
}



// Cambio de escalado
window.addEventListener('load', resize, false);

function resize() {
    console.log("Resize")
    var escaladoAncho = parseFloat(window.innerWidth / canvas.width);
    var escaladoAlto = parseFloat(window.innerHeight / canvas.height);

    escaladoMinimo = Math.min(escaladoAncho, escaladoAlto);

    canvas.width = canvas.width*escaladoMinimo;
    canvas.height = canvas.height*escaladoMinimo;

    contexto.scale(escaladoMinimo,escaladoMinimo);
}

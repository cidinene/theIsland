// Lista re recursos a precargar
var imagenes = {
    tiburon : "res/tiburon.png",
    barco : "res/barco.png",
    soldado1 : "res/soldado1.png",
    soldado2 : "res/soldado2.png",
    soldado3 : "res/soldado3.png",
    soldado4 : "res/soldado4.png",
    soldado5 : "res/soldado5.png",
    soldado6 : "res/soldado6.png",
    soldado7 : "res/soldado7.png",
    soldado8 : "res/soldado8.png",
    soldado9 : "res/soldado9.png",
    soldado10 : "res/soldado10.png",
    soldado11 : "res/soldado11.png",
    soldado12 : "res/soldado12.png",
    botonBonificacion : "res/botonBonificacion.png",
    botonNaranja1 : "res/botonNaranja1.png",
    botonNaranja2 : "res/botonNaranja2.png",
    botonNaranja3 : "res/botonNaranja3.png",
    botonNaranja4 : "res/botonNaranja4.png",
    botonGris4 : "res/botonGris4.png",
    botonGris3 : "res/botonGris3.png",
    botonGris2 : "res/botonGris2.png",
    botonGris1 : "res/botonGris1.png",
    botonPuntos : "res/botonPuntos.png",
    botonCrearPulsado : "res/botonCrearPulsado.png",
    botonCrearSinPulsar : "res/botonCrearSinPulsar.png",
    botonGrandeGris : "res/botonGrandeGris.png",
    botonGrandeGris : "res/botonGrandeGris.png",
    movimientoMarinero : "res/movimientoMarinero.png",
    movimientoBarco : "res/movimientoBarco.png",
    tile : "res/tile.png",
    tileMar : "res/tileMar.png",
    tile1 : "res/tile1.png",
    tile4 : "res/tile4.png",
    flechaAbajo : "res/flechaAbajo.png",
    flechaArriba : "res/flechaArriba.png",
    flechaDerecha : "res/flechaDerecha.png",
    flechaIzquierda : "res/flechaIzquierda.png",
    jugador : "res/jugador.png",
    fondo : "res/fondo.png",
    enemigo : "res/enemigo.png",
    enemigo_movimiento : "res/enemigo_movimiento.png",
    disparo_jugador : "res/disparo_jugador.png",
    disparo_enemigo : "res/disparo_enemigo.png",
    icono_puntos : "res/icono_puntos.png",
    icono_vidas : "res/icono_vidas.png",
    icono_recolectable : "res/icono_recolectable.png",
    fondo_2 : "res/fondo_2.png",
    jugador_idle_derecha : "res/jugador_idle_derecha.png",
    jugador_idle_izquierda : "res/jugador_idle_izquierda.png",
    jugador_corriendo_derecha : "res/jugador_corriendo_derecha.png",
    jugador_corriendo_izquierda : "res/jugador_corriendo_izquierda.png",
    jugador_disparando_derecha : "res/jugador_disparando_derecha.png",
    jugador_disparando_izquierda : "res/jugador_disparando_izquierda.png",
    jugador_saltando_derecha : "res/jugador_saltando_derecha.png",
    jugador_saltando_izquierda : "res/jugador_saltando_izquierda.png",
    enemigo_morir : "res/enemigo_morir.png",
    bloque_tierra : "res/bloque_tierra.png",
    bloque_metal : "res/bloque_metal.png",
    bloque_fondo_muro : "res/bloque_fondo_muro.png",
    copa : "res/copa.png",
    pad :"res/pad.png",
    boton_disparo : "res/boton_disparo.png",
    boton_salto : "res/boton_salto.png",
    boton_pausa : "res/boton_pausa.png",
    menu_fondo : "res/menu_fondo.png",
    boton_jugar : "res/boton_jugar.png",
    mensaje_como_jugar : "res/mensaje_como_jugar.png",
    mensaje_ganar : "res/mensaje_ganar.png",
    mensaje_perder : "res/mensaje_perder.png",

};

var rutasImagenes = Object.values(imagenes);
cargarImagenes(0);

function cargarImagenes(indice){
    var imagenCargar = new Image();
    imagenCargar.src = rutasImagenes[indice];
    imagenCargar.onload = function(){
        if ( indice < rutasImagenes.length-1 ){
            indice++;
            cargarImagenes(indice);
        } else {
            iniciarJuego();
        }
    }
}

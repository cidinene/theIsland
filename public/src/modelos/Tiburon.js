class Tiburon extends Actor {

    constructor(x, y) {
        super(imagenes.tiburon , x, y)
        this.ancho = 64; // a veces falla al cargar la imagen si no se pone a mano
        this.alto = 64; // a veces falla al cargar la imagen si no se pone a mano
    }

}

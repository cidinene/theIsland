class Barco extends Actor {

    constructor(x, y) {
        super(imagenes.barco , x, y)
        this.ancho = 64; // a veces falla al cargar la imagen si no se pone a mano
        this.alto = 64; // a veces falla al cargar la imagen si no se pone a mano
        this.marineros = [];
    }

    dibujar (scrollX, scrollY){
        scrollX = scrollX || 0;
        scrollY = scrollY || 0;
        contexto.drawImage(this.imagen,
            this.x - this.imagen.width/2 - scrollX,
            this.y - this.imagen.height/2  - scrollY);

        // nombre
        contexto.font = "16px Arial";
        contexto.fillStyle = "white";
        contexto.textAlign = "left";
        if ( this.marineros[0] != null){
            contexto.fillText(this.marineros[0].nombre,
                this.x - this.imagen.width/2 - scrollX + 5,
                this.y - this.imagen.height/2  - scrollY + 10 + 40);
        }
        if ( this.marineros[1] != null){
            contexto.fillText(this.marineros[1].nombre,
                this.x - this.imagen.width/2 - scrollX + 5,
                this.y - this.imagen.height/2  - scrollY + 10 + 20);
        }
        if ( this.marineros[2] != null){
            contexto.fillText(this.marineros[2].nombre,
                this.x - this.imagen.width/2 - scrollX + 5,
                this.y - this.imagen.height/2  - scrollY + 10);
        }
    }

}

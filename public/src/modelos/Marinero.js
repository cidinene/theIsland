class Marinero extends Actor {

    constructor(nombre, color, x, y) {
        var posiblesImagenes = [ imagenes.soldado1 , imagenes.soldado2, imagenes.soldado3,
            imagenes.soldado4 , imagenes.soldado5, imagenes.soldado6,
            imagenes.soldado7 , imagenes.soldado8, imagenes.soldado9,
            imagenes.soldado10 , imagenes.soldado11, imagenes.soldado12,
            imagenes.soldado1 , imagenes.soldado2, imagenes.soldado3,
            imagenes.soldado4 , imagenes.soldado5, imagenes.soldado6,
            imagenes.soldado7 , imagenes.soldado8, imagenes.soldado9,
            imagenes.soldado10 , imagenes.soldado11, imagenes.soldado12,
            imagenes.soldado1 , imagenes.soldado2, imagenes.soldado3,
            imagenes.soldado4 , imagenes.soldado5, imagenes.soldado6,
            imagenes.soldado7 , imagenes.soldado8, imagenes.soldado9,
            imagenes.soldado10 , imagenes.soldado11, imagenes.soldado12,
            imagenes.soldado1 , imagenes.soldado2, imagenes.soldado3,
            imagenes.soldado4 , imagenes.soldado5, imagenes.soldado6,
            imagenes.soldado7 , imagenes.soldado8, imagenes.soldado9,
            imagenes.soldado10 , imagenes.soldado11, imagenes.soldado12,
			imagenes.soldado1 , imagenes.soldado2, imagenes.soldado3,
            imagenes.soldado4 , imagenes.soldado5, imagenes.soldado6,
            imagenes.soldado7 , imagenes.soldado8, imagenes.soldado9,
            imagenes.soldado10 , imagenes.soldado11, imagenes.soldado12,
			imagenes.soldado1 , imagenes.soldado2, imagenes.soldado3,
            imagenes.soldado4 , imagenes.soldado5, imagenes.soldado6,
            imagenes.soldado7 , imagenes.soldado8, imagenes.soldado9,
            imagenes.soldado10 , imagenes.soldado11, imagenes.soldado12,
			imagenes.soldado1 , imagenes.soldado2, imagenes.soldado3,
            imagenes.soldado4 , imagenes.soldado5, imagenes.soldado6,
            imagenes.soldado7 , imagenes.soldado8, imagenes.soldado9,
            imagenes.soldado10 , imagenes.soldado11, imagenes.soldado12,
			imagenes.soldado1 , imagenes.soldado2, imagenes.soldado3,
            imagenes.soldado4 , imagenes.soldado5, imagenes.soldado6,
            imagenes.soldado7 , imagenes.soldado8, imagenes.soldado9,
            imagenes.soldado10 , imagenes.soldado11, imagenes.soldado12];
        super(posiblesImagenes[color] , x, y)
        this.ancho = 64; // a veces falla al cargar la imagen si no se pone a mano
        this.alto = 64; // a veces falla al cargar la imagen si no se pone a mano
        this.nombre = nombre;
        this.enBarco = false;
        // recortar, maximo 6 caracteres
        if (this.nombre.length > 6){
            this.nombre = this.nombre.substring(0, 6);
        }
    }

    dibujar (scrollX, scrollY){
        if (this.enBarco){
            return true;
        }
        scrollX = scrollX || 0;
        scrollY = scrollY || 0;
		if (this.imagen != undefined)
			contexto.drawImage(this.imagen,
				this.x - this.imagen.width/2 - scrollX,
				this.y - this.imagen.height/2  - scrollY);

        // nombre
        contexto.font = "16px Arial";
        contexto.fillStyle = "white";
        contexto.textAlign = "left";
		this.nombre != undefined
			contexto.fillText(this.nombre,
				this.x - this.imagen.width/2 - scrollX + 5,
				this.y - this.imagen.height/2  - scrollY + 10);
    }

    actualizar(){

    }

}

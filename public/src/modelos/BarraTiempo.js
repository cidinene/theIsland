class BarraTiempo {

    constructor(valor,x, y) {
        this.valor = valor;
        this.x = x;
        this.y = y;
        this.ancho = 100;
        this.alto = 20;
    }

    dibujar (scrollX, scrollY){
        scrollX = scrollX || 0;
        scrollY = scrollY || 0;

        contexto.beginPath();
        contexto.fillStyle = "#000000"; // Negro
        contexto.fillRect(this.x -2, this.y-2,  this.ancho+4, this.alto+4);
        contexto.stroke();

        contexto.beginPath();
        contexto.fillStyle = "#FF0000"; // Rojo
        contexto.fillRect(this.x, this.y,  this.ancho, this.alto);
        contexto.stroke();

        contexto.beginPath();
        contexto.fillStyle = "#37FE00"; // Verde
        contexto.fillRect(this.x, this.y,  this.ancho*parseFloat(this.valor/100), this.alto);
        contexto.stroke();

    }

}

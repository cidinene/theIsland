class GameLayer extends Layer {

    constructor() {
        super();
        this.iniciar();
    }

    iniciar() {
        // Se necesita poner un fondo negro como primera capa
        this.fondo =  new Fondo(imagenes.fondo, 480*0.5,320*0.5);

        this.creandoMarinero = false;
        this.marineroSeleccionado = null;
        this.tiburonSeleccionado = null;
        this.barcoSeleccionado = null;
        this.marineros = [];
        this.tiburones = [];
        this.barcos = [];
        this.tiempoUltimoMovimiento = 0;
        this.marinerosSocket = null; // Actualización de los marineros recibida por el socket.
        this.tiburonesSocket = null; // Actualización de los tiburones recibida por el socket.
        this.scrollX = 0;
        this.scrollY = 0;
        this.bloques = [];

        this.misMarinerosAux = []; // Solo contiene los marineros del jugador, sirve para los botones de acceso rápido


        this.botonPuntos =
            new Fondo(imagenes.botonPuntos, 480*0.07,320*0.09);

        this.puntos = new Texto(0,480*0.18,320*0.07 );
        this.cargarMapa("res/"+nivelActual+".txt");

        this.botonFlechaScrollArriba =
            new Boton(imagenes.flechaArriba , 480*0.5,320*0.08);
        this.botonFlechaScrollAbajo =
            new Boton(imagenes.flechaAbajo , 480*0.5,320*0.92);
        this.botonFlechaScrollDerecha =
            new Boton(imagenes.flechaDerecha , 480*0.95,320*0.5);
        this.botonFlechaScrollIzquierda =
            new Boton(imagenes.flechaIzquierda , 480*0.05,320*0.5);

        this.botonCrearMarinero =
            new Boton(imagenes.botonCrearSinPulsar , 480*0.2,320*0.9);
        this.botonBonificacion =
            new Boton(imagenes.botonBonificacion , 480*0.78,320*0.1);

        this.boton1 =
            new Boton(imagenes.botonGris1 , 480*0.65,320*0.9);
        this.boton2 =
            new Boton(imagenes.botonGris2 , 480*0.79,320*0.9);
        this.boton3 =
            new Boton(imagenes.botonGris3 , 480*0.93,320*0.9);

        this.focoMarineroSeleccionado = new Bloque(imagenes.movimientoMarinero, 0,0);
        this.focoMarineroSeleccionado.dibujarEnPantalla = false;
        this.focoTiburonSeleccionado = new Bloque(imagenes.movimientoMarinero, 0,0);
        this.focoTiburonSeleccionado.dibujarEnPantalla = false;
        this.focoBarcoSeleccionado = new Bloque(imagenes.movimientoBarco, 0,0);
        this.focoBarcoSeleccionado.dibujarEnPantalla = false;

        this.barraTiempo = new BarraTiempo(100,480*0.22,320*0.02);

        // IMPORTANTE. HAY que hacerlo con bind(this) por el contexto , si metemos una
        // funcion anonima no vamos a poder acceder a las variables de la clase.
        socket.on('marineros', this.actualizarMarineros.bind(this) );
        socket.on('tiburones', this.actualizarTiburones.bind(this) );
        socket.on('barcos', this.actualizarBarcos.bind(this) );
        socket.on('puntos', this.actualizarPuntos.bind(this));

        // Recibe el procesamiento de una respuesta
        socket.on('respuesta', this.actualizarRespuesta.bind(this));
    }

    actualizarRespuesta (msg) {
        if ( msg.resultado ){
            console.log("Respuesta correcta");
            // Simulamos un tiempo inferior ( te va a dejar mover antes).
            this.tiempoUltimoMovimiento = msg.tiempo;
        } else {
            console.log("Respuesta incorrecta");
        }
    }
    actualizarPuntos (msg) {
        this.puntos.valor = msg.puntos;
    }

    actualizarMarineros (msg) {
        this.marinerosSocket = msg;
    }

    actualizarTiburones (msg) {
        this.tiburonesSocket = msg;
    }

    actualizarBarcos (msg) {
        this.barcosSocket = msg;
    }

    actualizar (){
        for( var i=0; i < this.marineros.length; i++){
            if (this.barcos.find(e => e.x == this.marineros[i].x && e.y == this.marineros[i].y) != null) {
                // Hay un barco en esa posición, asi que esta en un barco
                this.marineros[i].enBarco = true;
            }
        }

        // Actualizar la barra de tiempo, no sirve para nada funcional, solo decoración
        var tiempoHaPasado = Date.now() - this.tiempoUltimoMovimiento;
        if (tiempoHaPasado >= tiempoEstandarMovimiento){
            tiempoHaPasado = tiempoEstandarMovimiento;
        }
        this.barraTiempo.valor = (tiempoHaPasado / tiempoEstandarMovimiento) *100;


        // Se han recibido posiciones nuevas de los marineros en el socket
        // Eliminar los anteriores y cambiarlos
        if ( this.marinerosSocket != null) {
            console.log("marinerosSocket es != null")
            // Vaciamos la actual lista
            this.marineros = [];
            for (var i = 0; i < this.marinerosSocket.length; i++) {
                var marinero = new Marinero(this.marinerosSocket[i].nombre, this.marinerosSocket[i].color,
                    this.marinerosSocket[i].x, this.marinerosSocket[i].y);
                this.marineros.push(marinero);
            }
            // Ya están todos creados, ponemos a null la lista
            this.marinerosSocket = null;

            // ¿otro jugador se ha comido al marinero que teniamos seleccionado?
            if ( this.marineroSeleccionado != null) {
                var marineroBuscado = this.marineros.find(e => (e.x == this.marineroSeleccionado.x && e.y == this.marineroSeleccionado.y));
                if ( marineroBuscado == null){
                    this.desmarcarTodo();
                }
            }

            // Actualizar mis marineros
            this.misMarinerosAux = this.marineros.filter(e => (e.nombre == nombreJugadorSocket));

        }

        // Se han recibido posiciones nuevas de los tiburones en el socket
        // Eliminar los anteriores y cambiarlos
        if ( this.tiburonesSocket != null) {
            // Vaciamos la actual lista
            this.tiburones = [];
            for (var i = 0; i < this.tiburonesSocket.length; i++) {
                var tiburon = new Tiburon(this.tiburonesSocket[i].x, this.tiburonesSocket[i].y);
                this.tiburones.push(tiburon);
            }
            // Ya están todos creados, ponemos a null la lista
            this.tiburonesSocket = null;

            // ¿otro jugador ha movido un tiburon que teniamos seleccionado?
            if ( this.tiburonSeleccionado != null) {
                var tiburonBuscado = this.tiburones.find(e => (e.x == this.tiburonSeleccionado.x && e.y == this.tiburonSeleccionado.y));
                if ( tiburonBuscado == null){
                    this.desmarcarTodo();
                }
            }
        }


        // Se han recibido posiciones nuevas de los Barcos en el socket
        // Eliminar los anteriores y cambiarlos
        if ( this.barcosSocket != null) {
            // Vaciamos la actual lista
            this.barcos = [];
            for (var i = 0; i < this.barcosSocket.length; i++) {
                var barco = new Barco(this.barcosSocket[i].x, this.barcosSocket[i].y);

                for(var r=0; r < this.barcosSocket[i].marineros.length; r++){
                    // busco en marinero en mi lista y lo agrego al barco.
                    var marineroEncontrado = this.marineros.find(e => (e.x == this.barcosSocket[i].marineros[r].x && e.y == this.barcosSocket[i].marineros[r].y && e.nombre == this.barcosSocket[i].marineros[r].nombre));
                    barco.marineros.push(marineroEncontrado);
                }

                this.barcos.push(barco);
            }
            // Ya están todos creados, ponemos a null la lista
            this.barcosSocket = null;

            // ¿otro jugador ha movido un tiburon que teniamos seleccionado?
            if ( this.barcoSeleccionado != null) {
                var barcoBuscado = this.barcos.find(e => (e.x == this.barcoSeleccionado.x && e.y == this.barcoSeleccionado.y));
                if ( barcoBuscado == null){
                    this.desmarcarTodo();
                }
            }
        }

    }

    dibujar (){
        this.fondo.dibujar();

        for (var i=0; i < this.bloques.length; i++){
            this.bloques[i].dibujar(this.scrollX,this.scrollY);
        }

        if (this.focoMarineroSeleccionado.dibujarEnPantalla){
            this.focoMarineroSeleccionado.dibujar(this.scrollX,this.scrollY)
        }

        if (this.focoTiburonSeleccionado.dibujarEnPantalla){
            this.focoTiburonSeleccionado.dibujar(this.scrollX,this.scrollY)
        }

        if (this.focoBarcoSeleccionado.dibujarEnPantalla){
            this.focoBarcoSeleccionado.dibujar(this.scrollX,this.scrollY)
        }

        for (var i=0; i < this.marineros.length; i++){
            this.marineros[i].dibujar(this.scrollX,this.scrollY);
        }

        for (var i=0; i < this.tiburones.length; i++){
            this.tiburones[i].dibujar(this.scrollX,this.scrollY);
        }

        for (var i=0; i < this.barcos.length; i++){
            this.barcos[i].dibujar(this.scrollX,this.scrollY);
        }

        // HUD
        this.botonPuntos.dibujar();
        this.puntos.dibujar();

        this.botonFlechaScrollArriba.dibujar();
        this.botonFlechaScrollAbajo.dibujar();
        this.botonFlechaScrollDerecha.dibujar();
        this.botonFlechaScrollIzquierda.dibujar();

        this.botonCrearMarinero.dibujar();
        this.botonBonificacion.dibujar();
        this.barraTiempo.dibujar();

        // Botones de acceso rápido a mis marineros
        if ( this.misMarinerosAux.length >= 1)
            this.boton1.dibujar();
        if ( this.misMarinerosAux.length >= 2)
            this.boton2.dibujar();
        if ( this.misMarinerosAux.length >= 3)
            this.boton3.dibujar();
    }


    procesarControles( ){

    }


    cargarMapa(ruta){
        var fichero = new XMLHttpRequest();
        fichero.open("GET", ruta, false);

        fichero.onreadystatechange = function () {
            var texto = fichero.responseText;
            var lineas = texto.split('\n');
            this.anchoMapa = (lineas[0].length-1) * 64;
            for (var i = 0; i < lineas.length; i++){
                var linea = lineas[i];

                for (var j = 0; j < linea.length; j++){
                    var simbolo = linea[j];
                    var x = 64/2 + j * 64; // x central
                    var y = 64 + i * 64; // y de abajo
                    this.cargarObjetoMapa(simbolo,x,y);
                }
            }
        }.bind(this);

        fichero.send(null);
    }

    cargarObjetoMapa(simbolo, x, y){

        switch(simbolo) {
            case "#": // Bloque de salvamento
                var bloque = new Bloque(imagenes.tile, x,y);
                bloque.tipo = 2;
                this.bloques.push(bloque);
                break;
            case "E": // Bloque de salvamento
                var bloque = new Bloque(imagenes.tileMar, x,y);
                bloque.tipo = 1;
                this.bloques.push(bloque);
                break;
            case ".":
                var bloque = new Bloque(imagenes.tile1, x,y);
                bloque.tipo = 0;
                this.bloques.push(bloque);
        }
    }

    hayMarineroEnBloque(bloque){
        for(var i=0; i < this.marineros.length; i++) {
            if ( this.marineros[i].x == bloque.x && this.marineros[i].y == bloque.y){
                return true;
            }
        }
        return false;
    }

    hayTiburonEnBloque(bloque){
        for(var i=0; i < this.tiburones.length; i++) {
            if ( this.tiburones[i].x == bloque.x && this.tiburones[i].y == bloque.y){
                return true;
            }
        }
        return false;
    }

    hayBarcoEnBloque(bloque){
        for(var i=0; i < this.barcos.length; i++) {
            if ( this.barcos[i].x == bloque.x && this.barcos[i].y == bloque.y){
                return true;
            }
        }
        return false;
    }

    calcularPulsaciones(pulsaciones){
        // Suponemos botones no estan pulsados
        for(var i=0; i < pulsaciones.length; i++) {
            // Botones de realizar acciones

            // Botones de centrar la vista en un marinero
            if (this.boton1.contienePunto(pulsaciones[i].x, pulsaciones[i].y)) {
                if (pulsaciones[i].tipo == tipoPulsacion.inicio){
                    this.scrollX = this.misMarinerosAux[0].x - 480/2;
                    this.scrollY = this.misMarinerosAux[0].y - 320/2;
                }
            }
            if (this.boton2.contienePunto(pulsaciones[i].x, pulsaciones[i].y)) {
                if (pulsaciones[i].tipo == tipoPulsacion.inicio){
                    this.scrollX = this.misMarinerosAux[1].x - 480/2;
                    this.scrollY = this.misMarinerosAux[1].y - 320/2;
                }
            }
            if (this.boton3.contienePunto(pulsaciones[i].x, pulsaciones[i].y)) {
                if (pulsaciones[i].tipo == tipoPulsacion.inicio){
                    this.scrollX = this.misMarinerosAux[2].x - 480/2;
                    this.scrollY = this.misMarinerosAux[2].y - 320/2;
                }
            }

            if (this.botonCrearMarinero.contienePunto(pulsaciones[i].x, pulsaciones[i].y)) {
                if (pulsaciones[i].tipo == tipoPulsacion.inicio && this.creandoMarinero == false) {
                    this.creandoMarinero = true;
                    // Deseleccionar al mover
                    this.botonCrearMarinero.imagen.src = imagenes.botonCrearPulsado;
                    this.desmarcarTodo();
                    return;
                } else if (pulsaciones[i].tipo == tipoPulsacion.inicio && this.creandoMarinero == true) {
                    this.creandoMarinero = false;
                    // Deseleccionar al mover
                    this.botonCrearMarinero.imagen.src = imagenes.botonCrearSinPulsar;
                    this.desmarcarTodo();
                    return;
                }
            }
            // Boton ver puntuaciones
            if (this.botonPuntos.contienePunto(pulsaciones[i].x, pulsaciones[i].y)) {
                if (pulsaciones[i].tipo == tipoPulsacion.inicio) {
                    mostrarPanelPuntuaciones() // función del index.html
                    return;
                }
            }

            // Boton Bonificación, contesta una pregunta y reduce el tiempo de espera
            if (this.botonBonificacion.contienePunto(pulsaciones[i].x, pulsaciones[i].y)) {
                if (pulsaciones[i].tipo == tipoPulsacion.inicio) {
                    mostrarPanelBonificacion() // función del index.html
                    return;
                }
            }

            // Botones de mover por el mapa
            if (this.botonFlechaScrollArriba.contienePunto(pulsaciones[i].x, pulsaciones[i].y)) {
                if (pulsaciones[i].tipo == tipoPulsacion.inicio) {
                    this.scrollY -= 64;
                    return;
                }
            }
            if (this.botonFlechaScrollAbajo.contienePunto(pulsaciones[i].x, pulsaciones[i].y)) {
                if (pulsaciones[i].tipo == tipoPulsacion.inicio) {
                    this.scrollY += 64;
                    return;
                }
            }
            if (this.botonFlechaScrollDerecha.contienePunto(pulsaciones[i].x, pulsaciones[i].y)) {
                if (pulsaciones[i].tipo == tipoPulsacion.inicio) {
                    this.scrollX += 64;
                    return;
                }
            }
            if (this.botonFlechaScrollIzquierda.contienePunto(pulsaciones[i].x, pulsaciones[i].y)) {
                if (pulsaciones[i].tipo == tipoPulsacion.inicio) {
                    this.scrollX -= 64;
                    return;
                }
            }

            // Son Barcos todos pueden moverlos, si no hay nadie dentro
            // Si hay alguien dentro solo lo mueve el primero que entro barco.nombre
            for(var j=0; j < this.barcos.length; j++) {
                if (pulsaciones[i].tipo == tipoPulsacion.inicio)  {

                    this.actualizar(); // Por si acaso habia tiburoes nuevos sin cargar.
                    if (this.barcos[j].contienePunto(pulsaciones[i].x + this.scrollX, pulsaciones[i].y + this.scrollY)) {

                        // Si hay un marinero seleccionado es posible que lo esten queriendo subir en el barco
                        // Si hay un tiburon seleccionado es posible que este querienco comerse el barco
                        if (this.marineroSeleccionado == null && this.tiburonSeleccionado == null){


                            if (this.barcos[j].marineros.length > 0 && this.barcos[j].marineros.find(e => (e.nombre == nombreJugadorSocket) == null)){
                                return true; // No puedes seleccionarlo si tiene marineros subidos y NINGUNO es tuyo.
                            }

                            this.barcoSeleccionado = this.barcos[j];
                            this.marcarBarco();
                            return;
                        } else {
                            if (this.marineroSeleccionado != null && this.tiburonSeleccionado == null) {
								
								if ( Math.abs(this.marineroSeleccionado.x - this.barcos[j].x) > 64 || Math.abs(this.marineroSeleccionado.y - this.barcos[j].y) > 64 ){
									this.desmarcarTodo();
									return true;
								}
							
                                // Subir el marinero el barco
                                socket.emit('subirMarinero', {
                                    m_x: this.marineroSeleccionado.x,
                                    m_y: this.marineroSeleccionado.y,
                                    b_x: this.barcos[j].x,
                                    b_y: this.barcos[j].y
                                });
								
								this.tiempoUltimoMovimiento = Date.now();
                                return;
                            }

                        }

                    }
                }
            }

            // Son tiburones todos pueden moverlos
            for(var j=0; j < this.tiburones.length; j++) {
                if (pulsaciones[i].tipo == tipoPulsacion.inicio)  {
                    this.actualizar(); // Por si acaso habia tiburoes nuevos sin cargar.
                    if (this.tiburones[j].contienePunto(pulsaciones[i].x + this.scrollX, pulsaciones[i].y + this.scrollY)) {
                        console.log("Tiburon pulsado")
                        this.tiburonSeleccionado = this.tiburones[j];
                        this.marcarTiburon();
                        return;
                    }
                }
            }

            for(var j=0; j < this.marineros.length; j++) {
                // Es mi marinero
                if (this.marineros[j].nombre == nombreJugadorSocket){
                    if (pulsaciones[i].tipo == tipoPulsacion.inicio)  {
                        this.actualizar(); // Por si acaso habia marineros nuevos sin cargar.
                        if (this.marineros[j].contienePunto(pulsaciones[i].x + this.scrollX, pulsaciones[i].y + this.scrollY)) {
                            console.log("Marinero pulsado")
                            this.marineroSeleccionado = this.marineros[j];
                            this.marcarMarinero();
                            return;
                        }
                    }
                }
            }
            for(var j=0; j < this.bloques.length; j++) {
                if (this.bloques[j].contienePunto(pulsaciones[i].x + this.scrollX, pulsaciones[i].y + this.scrollY)) {
                    if (pulsaciones[i].tipo == tipoPulsacion.inicio) {

                        this.actualizar(); // Por si acaso habia marineros nuevos sin cargar.

                        // ¿Ha pasado el tiempo necesario para realizar una acción?
                        if ( Date.now() - this.tiempoUltimoMovimiento < tiempoEstandarMovimiento ){
                            return true;
                        }


                        // Crear un marinero, en bloque pulsado es de tipo tierra o mar (crea un barco)
                        // El bloque está vacio (no hay otro marinero)
                        if ( this.creandoMarinero && this.bloques[j].tipo != 2 && !this.hayMarineroEnBloque(this.bloques[j]) && !this.hayBarcoEnBloque(this.bloques[j])){
                            var msg = {
                                x: this.bloques[j].x,
                                y: this.bloques[j].y,
                                bloque: this.bloques[j].tipo
                            }
                            socket.emit('crearMarinero', msg);
                            this.tiempoUltimoMovimiento = Date.now();
                            this.botonCrearMarinero.imagen.src = imagenes.botonCrearSinPulsar;
                            this.creandoMarinero = false;
                            return;
                        }


                        // Mover un marinero que ya habias seleccionado
                        if ( this.marineroSeleccionado != null && !this.hayMarineroEnBloque(this.bloques[j])){

                            // ¿La distancia lde movimiento es mayor de 1 bloque?
                            if ( Math.abs(this.marineroSeleccionado.x - this.bloques[j].x) > 64 || Math.abs(this.marineroSeleccionado.y - this.bloques[j].y) > 64 ){
                                this.desmarcarTodo();
                                return true;
                            }

                            // i_x , i_y son las posiciones iniciales, f_x, f_y son las finales

                            var msg = {
                                i_x: this.marineroSeleccionado.x,
                                i_y: this.marineroSeleccionado.y,
                                f_x: this.bloques[j].x,
                                f_y: this.bloques[j].y,
                                bloque: this.bloques[j].tipo
                            }

                            socket.emit('moverMarinero', msg);
                            this.tiempoUltimoMovimiento = Date.now();

                            // Deseleccionar al mover
                            this.desmarcarTodo();
                            return;
                        }

                        // Mover tiburon
                        if ( this.tiburonSeleccionado != null && !this.hayTiburonEnBloque(this.bloques[j])){

                            // ¿La distancia lde movimiento es mayor de 1 bloque?
                            if ( Math.abs(this.tiburonSeleccionado.x - this.bloques[j].x) > 64 || Math.abs(this.tiburonSeleccionado.y - this.bloques[j].y) > 64 ){
                                this.desmarcarTodo();
                                return true;
                            }

                            // Solo puede ir a mar (bloques de tipo 1)
                            if ( this.bloques[j].tipo != 1){
                                // Deseleccionar al mover
                                this.desmarcarTodo();
                                return true;
                            }

                            // i_x , i_y son las posiciones iniciales, f_x, f_y son las finales

                            var msg = {
                                i_x: this.tiburonSeleccionado.x,
                                i_y: this.tiburonSeleccionado.y,
                                f_x: this.bloques[j].x,
                                f_y: this.bloques[j].y,
                                bloque: this.bloques[j].tipo
                            }

                            socket.emit('moverTiburon', msg);
                            this.tiempoUltimoMovimiento = Date.now();

                            // Deseleccionar al mover
                            this.desmarcarTodo();
                            return true;
                        }


                        // Mover Barco
                        if ( this.barcoSeleccionado != null && !this.hayBarcoEnBloque(this.bloques[j])){

                            // ¿La distancia lde movimiento es mayor de 1 bloque?
                            if ( Math.abs(this.barcoSeleccionado.x - this.bloques[j].x) > 64*3 || Math.abs(this.barcoSeleccionado.y - this.bloques[j].y) > 64*3 ){
                                this.desmarcarTodo();
                                return true;
                            }

                            // Desembarcar marineros
                            // Si el bloque No es mar  != 1 (mar)
                            // Esta solo a 1 bloque de distancia 64px
                            // El barco tiene marineros pertenecientes al jugador
                            if ( this.bloques[j].tipo != 1 &&
                                Math.abs(this.barcoSeleccionado.x - this.bloques[j].x) <= 64 && Math.abs(this.barcoSeleccionado.y - this.bloques[j].y) <= 64 &&
                                this.barcoSeleccionado.marineros.find(e => ( e.nombre == nombreJugadorSocket)) != null){


                                var msg = {
                                    nombre: nombreJugadorSocket,
                                    b_x: this.barcoSeleccionado.x,
                                    b_y: this.barcoSeleccionado.y,
                                    f_x: this.bloques[j].x,
                                    f_y: this.bloques[j].y,
                                    bloque: this.bloques[j].tipo
                                }
                                socket.emit('bajar', msg);
                                this.tiempoUltimoMovimiento = Date.now();
                                this.desmarcarTodo();
                                return true;
                            }

                            // Solo puede ir a mar (bloques de tipo 1)
                            if ( this.bloques[j].tipo != 1){
                                // Deseleccionar al mover
                                this.desmarcarTodo();
                                return true;
                            }

                            // i_x , i_y son las posiciones iniciales, f_x, f_y son las finales

                            if (this.barcoSeleccionado.marineros.length > 0 && this.barcoSeleccionado.marineros[0].nombre != nombreJugadorSocket){
                                return true; // No eres el capitan no puedes mover el barco.
                            }

                            var msg = {
                                i_x: this.barcoSeleccionado.x,
                                i_y: this.barcoSeleccionado.y,
                                f_x: this.bloques[j].x,
                                f_y: this.bloques[j].y,
                                bloque: this.bloques[j].tipo
                            }

                            socket.emit('moverBarco', msg);
                            this.tiempoUltimoMovimiento = Date.now();

                            // Deseleccionar al mover
                            this.desmarcarTodo();
                            return true;
                        }

                    }
                }
            }
        }
    }

    desmarcarTodo() {
        this.tiburonSeleccionado = null;
        this.focoTiburonSeleccionado.dibujarEnPantalla = false;
        this.marineroSeleccionado = null;
        this.focoMarineroSeleccionado.dibujarEnPantalla = false;
        this.barcoSeleccionado = null;
        this.focoBarcoSeleccionado.dibujarEnPantalla = false;
    }

    marcarTiburon() {
        // Quito marinero
        this.marineroSeleccionado = null;
        this.focoMarineroSeleccionado.dibujarEnPantalla = false;
        // Quito barco
        this.barcoSeleccionado = null;
        this.focoBarcoSeleccionado.dibujarEnPantalla = false;
        // Marco tiburon
        this.focoTiburonSeleccionado.x = this.tiburonSeleccionado.x;
        this.focoTiburonSeleccionado.y = this.tiburonSeleccionado.y;
        this.focoTiburonSeleccionado.dibujarEnPantalla = true;
    }

    marcarBarco() {
        // Quito marinero
        this.marineroSeleccionado = null;
        this.focoMarineroSeleccionado.dibujarEnPantalla = false;
        // Quito tiburon
        this.tiburonSeleccionado = null;
        this.focoTiburonSeleccionado.dibujarEnPantalla = false;
        // Marco barco
        this.focoBarcoSeleccionado.x = this.barcoSeleccionado.x;
        this.focoBarcoSeleccionado.y = this.barcoSeleccionado.y;
        this.focoBarcoSeleccionado.dibujarEnPantalla = true;
    }
    marcarMarinero() {
        // Quito tiburon
        this.tiburonSeleccionado = null;
        this.focoTiburonSeleccionado.dibujarEnPantalla = false;
        // Quito barco
        this.barcoSeleccionado = null;
        this.focoBarcoSeleccionado.dibujarEnPantalla = false;
        // Marco marinero
        this.focoMarineroSeleccionado.x = this.marineroSeleccionado.x;
        this.focoMarineroSeleccionado.y = this.marineroSeleccionado.y;
        this.focoMarineroSeleccionado.dibujarEnPantalla = true;
    }
}

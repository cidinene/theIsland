import { serverGameElements, timeUpdate } from "./server/serverGameIA.js";
import express from 'express';
import fs from 'fs';
import  parse from 'csv-parse';
import  stringSimilarity from 'string-similarity';
import { Server } from "socket.io";


const appServerSocket = express();


// Datos almacenados
//var tiempoEstandarMovimiento = 300000;
var tiempoEstandarMovimiento = 30000;
var tiempoBonificacionPregunta = 15000;
var portApp = 3039;


var alumnos=[];
var preguntas=[];
var ultimaPosicionPreguntas = 0; // la posición de la última pregunta
var alumnosLogeados = []; // Guarda el socket.id y el nombre
var marineros=[];
var tiburones=[];
var barcos=[];



var horas = [
    { d: "lunes",       ha:0, ma: 0, hc:23, mc:59},
    { d: "martes",      ha:0, ma: 0, hc:23, mc:59},
    { d: "miercoles",   ha:0, ma: 0, hc:23, mc:59},
    { d: "jueves",      ha:0, ma: 0, hc:23, mc:59},
    { d: "viernes",     ha:0, ma: 0, hc:23, mc:59},
    { d: "sabado",      ha:0, ma: 0, hc:23, mc:59},
    { d: "domingo",     ha:0, ma: 0, hc:23, mc:59}
]


 
 //setInterval(() => timeUpdate(serverGameElements.init.bind(alumnos, preguntas,ultimaPosicionPreguntas,alumnosLogeados,marineros,tiburones,barcos)),1000);
 setInterval(() => timeUpdate(serverGameElements),1000);

/**
var horas = [
    { d: "lunes", ha:11, ma: 0, hc:12, mc:30},
    { d: "martes", ha:18, ma: 0, hc:18, mc:59},
    { d: "miercoles", ha:11, ma: 45, hc:14, mc:15},
    { d: "jueves", ha:11, ma: 0, hc:12, mc:30}
    ]
**/
var randomToken = "grupo1-3UzezLxUSG";

function quitarAcentos(cadena){
    const acentos = {'á':'a','é':'e','í':'i','ó':'o','ú':'u','Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U'};
    return cadena.split('').map( letra => acentos[letra] || letra).join('').toString();
}

appServerSocket.use(express.static('public'));

appServerSocket.get('/'+randomToken+'/descargar', function(req, res){
    const file = 'respuestas.csv';
    res.download(file); // Set disposition and send it.
});


appServerSocket.get('/'+randomToken+'/puntos', function(req, res) {
    var puntuacionesProfesor = "";
    for (var i=0; i <  alumnosLogeados.length; i++){
        puntuacionesProfesor+= alumnosLogeados[i].nombre+";"+alumnosLogeados[i].puntos+"<br>";
    }
    res.send(puntuacionesProfesor);
});
appServerSocket.get('/'+randomToken+'/reiniciar', function(req, res) {
    iniciarElementosJuego();
    res.send('Juego restablecido');
});



const server = appServerSocket.listen(portApp,console.log("Servidor en "+portApp));
const io = new Server(server)
//const io = require('socket.io')(server);







function iniciarElementosJuego(){
    // esto Tiene las puntuaciones
    alumnosLogeados = [];
    marineros=[];
    tiburones=[
        {x: 64*2 -64/2, y: 64*2},
    ];
     barcos=[
        {x: 120*2 -120*2, y: 80*2,  marineros:[] },			
    ];
}
iniciarElementosJuego();

function comprobarHora(){
    var current = new Date();

    var days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

    var dia = days[current.getDay()];
    var hora = current. getHours()
    var minuto = current. getMinutes()
    console.log(dia+" "+hora+":"+minuto)

    const horaFound = horas.find(e => e.d == dia);
    if ( horaFound == null){
        return false;
    }


    if (hora >= horaFound.ha && hora <= horaFound.hc ){
        if (minuto >= horaFound.ma && hora <= horaFound.mc ) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

// Socket
io.on('connection', (socket) => {

    // Enviar todos los marineros
    console.log("Conectado "+socket.id);

    socket.on('login', (msg) => {
        console.log("Login "+socket.id)

        let alumnoEncontrado = alumnos.find(e => (e.nombre == msg.nombre && e.password == msg.password));
        if ( alumnoEncontrado != null ){
            let alumnoLogueado = alumnosLogeados.find(e => (e.nombre == msg.nombre ));
            if ( alumnoLogueado == null ) {
                // No estaba, lo metemos en la lista de logueados
                alumnoLogueado = {
                    socketid: socket.id,
                    color: alumnoEncontrado.color,
                    nombre: msg.nombre,
                    tiempo: 0, // tiempo ultimo movimiento.
                    espera : tiempoEstandarMovimiento,
                    puntos: 0,
                    pregunta : 1,
                }
                alumnosLogeados.push(alumnoLogueado);
            } else {
                // ya estaba, se ha reconectado, le cambiamos la id del socket
                alumnoLogueado.socketid = socket.id;
            }
            // Mensaje para uno solo
            //socket.broadcast.to(socket.id).emit('login','identificado'+socket.id)
            socket.emit('loginResponse', {
                socketid : socket.id,
                nombre : msg.nombre,
            })

            socket.emit('puntos', { puntos : alumnoLogueado.puntos });
            socket.emit('marineros', marineros);
            socket.emit('tiburones', tiburones);
            socket.emit('barcos', barcos);
        }

    });

    // msg = i_x i_y  f_x f_y   nombre.
    socket.on('moverMarinero', (msg) => {
        if ( comprobarHora() == false){
            return;
        }

        // Tiene que ser un usuario valido (logueado)
        alumnoLogueado = alumnosLogeados.find(e => (e.socketid == socket.id));
        if ( alumnoLogueado == null ){
            return; // No está conectado
        }

        // El marinero existe o no es MIO
        marineroEncontrado = marineros.find(e => (e.nombre == alumnoLogueado.nombre && e.x == msg.i_x && e.y == msg.i_y));
        if ( marineroEncontrado != null ) {

            // No hay ningun marinero en la posición a la que se quiere ir.
            marineroEnPosicionDestino = marineros.find(e => ( e.x == msg.f_x && e.y == msg.f_y));
            if (marineroEnPosicionDestino != null){
                return; // Ya hay un marinero en esa posición
            }

            // Asegura que solo lo quieren mover una posición en X o Y, cada posición 64px
            if ( Math.abs(marineroEncontrado.x - msg.f_x) <= 64 && Math.abs(marineroEncontrado.y - msg.f_y) <= 64 ) {

                // ¿Hace poco tiempo que se ha movido?, hay un tiempo de espera
                if (  Date.now() - alumnoLogueado.tiempo < alumnoLogueado.espera){
                    return true;
                }

                // actualizar tiempo la ultima vez que movio
                alumnoLogueado.tiempo = Date.now();
                marineroEncontrado.x = msg.f_x;
                marineroEncontrado.y = msg.f_y;

                // Es un bloque de tierra
                if ( msg.bloque == 0){
                    // Nada especial
                }
                // Es un bloque de salvamento
                if ( msg.bloque == 2){
                    // Destruimos marinero y damos un punto.
                    marineros.splice(marineros.indexOf(marineroEncontrado),1);
                    alumnoLogueado.puntos++;
                    // Solo al interesado
                    socket.emit('puntos', { puntos : alumnoLogueado.puntos });
                }

                // Notificar a TODOS el movimiento de ese marinero ¿O de todos los marineros?.
                io.emit('marineros',marineros);
                return true;

            }
        }
    });


    // msg = i_x i_y  f_x f_y   nombre.
    socket.on('moverTiburon', (msg) => {
        if ( comprobarHora() == false){
            return;
        }
        // Tiene que ser un usuario valido (logueado)
        alumnoLogueado = alumnosLogeados.find(e => (e.socketid == socket.id));
        if ( alumnoLogueado == null ){
            return; // No está conectado
        }

        // El tiburon existe
        tiburonEncontrado = tiburones.find(e => (e.x == msg.i_x && e.y == msg.i_y));
        if ( tiburonEncontrado != null ) {

            // Solo puede ir a la posición de mar
            if ( msg.bloque != 1) {
                return true;
            }
            // Asegurarnos de que solo se mueve una posición
            if ( Math.abs(msg.i_x - msg.f_x) > 64 || Math.abs(msg.i_y - msg.f_y) > 64 ) {
                return true;
            }

            // ¿Hace poco tiempo que se ha movido?, hay un tiempo de espera
            if (  Date.now() - alumnoLogueado.tiempo < alumnoLogueado.espera){
                return true;
            }

            // Si hay marinero se lo come
            marineroEnPosicionDestino = marineros.find(e => ( e.x == msg.f_x && e.y == msg.f_y));
            if (marineroEnPosicionDestino != null){
                marineros.splice(marineros.indexOf(marineroEnPosicionDestino),1);
                io.emit('marineros',marineros);
            } else {

            }

            // Si hay barcos los destruye
            barcoEnPosicionDestino = barcos.find(e => ( e.x == msg.f_x && e.y == msg.f_y));
            if (barcoEnPosicionDestino != null){
                barcos.splice(barcos.indexOf(barcoEnPosicionDestino),1);
                io.emit('barcos',barcos);
            } else {

            }

            // actualizar tiempo la ultima vez que movio
            alumnoLogueado.tiempo = Date.now();
            tiburonEncontrado.x = msg.f_x;
            tiburonEncontrado.y = msg.f_y;

            // Notificar a TODOS el movimiento de ese marinero ¿O de todos los marineros?.
            io.emit('tiburones',tiburones);
            return true;

        }

    });

    var mv = 0;

    // msg = i_x i_y  f_x f_y   nombre.
    socket.on('moverBarco', (msg) => {
        if ( comprobarHora() == false){
            return;
        }

        console.log("moverBarco "+mv);
        mv++;
        // Tiene que ser un usuario valido (logueado)
        alumnoLogueado = alumnosLogeados.find(e => (e.socketid == socket.id));
        if ( alumnoLogueado == null ){
            return; // No está conectado
        }

        // El barco existe
        barcoEncontrado = barcos.find(e => (e.x == msg.i_x && e.y == msg.i_y));
        if ( barcoEncontrado != null ) {

            // Solo puede ir a la posición de mar
            if ( msg.bloque != 1) {
                return true;
            }
            // Asegurarnos de que solo se mueve una posición
            if ( Math.abs(msg.i_x - msg.f_x) > 64*33 || Math.abs(msg.i_y - msg.f_y) > 64*3 ) {
                return true;
            }

            // ¿Hace poco tiempo que se ha movido?, hay un tiempo de espera
            if (  Date.now() - alumnoLogueado.tiempo < alumnoLogueado.espera){
                return true;
            }

            // Si hay marinero o tiburon NO puede moverse
            marineroEnPosicionDestino = marineros.find(e => ( e.x == msg.f_x && e.y == msg.f_y));
            tiburonEnPosicionDestino = tiburones.find(e => ( e.x == msg.f_x && e.y == msg.f_y));
            if (marineroEnPosicionDestino != null || tiburonEnPosicionDestino != null){
                return true;
            }

            // actualizar tiempo la ultima vez que movio
            alumnoLogueado.tiempo = Date.now();
            barcoEncontrado.x = msg.f_x;
            barcoEncontrado.y = msg.f_y;
            // Actualizar todos los marineros que hay dentro ( se mueven igual que el barco)
            for (var i=0; i < barcoEncontrado.marineros.length; i++){
                barcoEncontrado.marineros[i].x = msg.f_x;
                barcoEncontrado.marineros[i].y = msg.f_y;
            }

            // Notificar a TODOS el movimiento de ese barco
            io.emit('barcos',barcos);
            io.emit('marineros',marineros);
            return true;

        }

    });

    socket.on('crearMarinero', (msg) => {
        if ( comprobarHora() == false){
            return;
        }

        // Tiene que ser un usuario valido (logueado)
        alumnoLogueado = alumnosLogeados.find(e => (e.socketid == socket.id));
        if ( alumnoLogueado == null ){
            return; // No está conectado
        }

        // ¿Hace poco tiempo que se ha movido?, hay un tiempo de espera
        if (  Date.now() - alumnoLogueado.tiempo < alumnoLogueado.espera) {
            return true;
        }

        // Solo NO se pueden crear marineros en bloques de salvamento.
        if ( msg.bloque == 2 ){
            return true;
        }

        // NO puede haber marinero en esa posición
        barcoEncontrado = barcos.find(e => (e.x == msg.x && e.y == msg.y));
        marineroEncontrado = marineros.find(e => (e.x == msg.x && e.y == msg.y));
        if ( marineroEncontrado == null && barcoEncontrado == null) {
            if ( msg.bloque == 0 ){
                marineros.push({
                    nombre: alumnoLogueado.nombre,
                    color: alumnoLogueado.color,
                    x: msg.x,
                    y: msg.y,
                })
                alumnoLogueado.tiempo = Date.now();
                // Envia a todos los SOCKETS, los marineros
                io.emit('marineros',marineros);
                // Lo envio 2 veces por si acaso, no está funcionando bien
                socket.emit('marineros',marineros);
            }
            if ( msg.bloque == 1 ){
                barcos.push({
                    marineros:[],
                    x: msg.x,
                    y: msg.y,
                })
                alumnoLogueado.tiempo = Date.now();
                // Envia a todos los SOCKETS, los marineros
                io.emit('barcos',barcos);
                // Lo envio 2 veces por si acaso, no está funcionando bien
                socket.emit('barcos',barcos);
            }
        }


    });

    // msg = m_x m_y  posiciones del marinero
    //       b_x b_y  posiciones del barco
    socket.on('subirMarinero', (msg) => {
        if ( comprobarHora() == false){
            return;
        }

        // Tiene que ser un usuario valido (logueado)
        alumnoLogueado = alumnosLogeados.find(e => (e.socketid == socket.id));
        if ( alumnoLogueado == null ){
            return; // No está conectado
        }

        // ¿Hace poco tiempo que se ha movido?, hay un tiempo de espera
        if (  Date.now() - alumnoLogueado.tiempo < alumnoLogueado.espera) {
            return true;
        }

        // Existe el marinero
        marineroEncontrado = marineros.find(e => (e.x == msg.m_x && e.y == msg.m_y && e.nombre == alumnoLogueado.nombre));
        // Existe el barco
        barcoEncontrado = barcos.find(e => (e.x == msg.b_x && e.y == msg.b_y));

        // Si alguno de los 2 no existe no se puede
        if (marineroEncontrado == null || barcoEncontrado == null){
            return true;
        }

        // Si el barco no tiene sitio no se puede
        if (barcoEncontrado.marineros.length >= 3){
            return true;
        }

        // Si llego hasta aqui subir al marinero al barco (quitandolo de su posición actual, ahora tiene la del barco).
        marineroEncontrado.x = barcoEncontrado.x;
        marineroEncontrado.y = barcoEncontrado.y;
        if ( barcoEncontrado.marineros.length == 0){
            barcoEncontrado.nombre = marineroEncontrado.nombre;
        }
        barcoEncontrado.marineros.push(marineroEncontrado);

        alumnoLogueado.tiempo = Date.now();
        // Envia a todos los SOCKETS, los marineros
        io.emit('marineros',marineros);
        // Lo envio 2 veces por si acaso, no está funcionando bien
        socket.emit('marineros',marineros);

        io.emit('barcos',barcos);
        // Lo envio 2 veces por si acaso, no está funcionando bien
        socket.emit('barcos',barcos);
    });

    // msg = b_x b_y  posiciones del barco
    //       f_x f_y  posiciones final donde colocar el marinero
    socket.on('bajar', (msg) => {
        if ( comprobarHora() == false){
            return;
        }

        console.log("BajarMarinero");
        // Tiene que ser un usuario valido (logueado)
        alumnoLogueado = alumnosLogeados.find(e => (e.socketid == socket.id));
        if ( alumnoLogueado == null ){
            return; // No está conectado
        }

        // ¿Hace poco tiempo que se ha movido?, hay un tiempo de espera
        if (  Date.now() - alumnoLogueado.tiempo < alumnoLogueado.espera) {
            return true;
        }

        // Existe el marinero
        marineroEncontrado = marineros.find(e => (e.x == msg.b_x && e.y == msg.b_y && e.nombre == alumnoLogueado.nombre));
        // Existe el barco
        barcoEncontrado = barcos.find(e => (e.x == msg.b_x && e.y == msg.b_y));
        // marinero donde queremos colocar el nuestro
        marineroPosicionFinal = marineros.find(e => (e.x == msg.f_x && e.y == msg.f_y));

        // Si alguno de los 2 no existe no se puede
        if (marineroEncontrado == null || barcoEncontrado == null){
            return true;
        }

        // Ya hay uno en la posición
        if ( marineroPosicionFinal != null){
            return true;
        }


        // Si llego hasta aqui, mover al marinero y quitarlo del barco
        marineroEncontrado.x = msg.f_x;
        marineroEncontrado.y = msg.f_y;
        barcoEncontrado.marineros.splice(marineroEncontrado,1);

        if ( msg.bloque == 2){
            // Era un bloque de salvamento hay que aumentar los puntos
            marineros.splice(marineros.indexOf(marineroEncontrado),1);
            alumnoLogueado.puntos++;
            // Solo al interesado
            socket.emit('puntos', { puntos : alumnoLogueado.puntos });
        }

        alumnoLogueado.tiempo = Date.now();
        // Envia a todos los SOCKETS, los marineros
        io.emit('marineros',marineros);
        // Lo envio 2 veces por si acaso, no está funcionando bien
        socket.emit('marineros',marineros);

        io.emit('barcos',barcos);
        // Lo envio 2 veces por si acaso, no está funcionando bien
        socket.emit('barcos',barcos);
    });

    socket.on('puntuaciones', (msg) => {

        var puntuaciones = [];
        for (var i=0; i <  alumnosLogeados.length; i++){
            puntuaciones.push({
                nombre : alumnosLogeados[i].nombre,
                puntos : alumnosLogeados[i].puntos,
            });
        }
        puntuaciones.sort(function(a, b){return b.puntos - a.puntos});
        socket.emit('puntuaciones',puntuaciones);

    });


    socket.on('pregunta', (msg) => {
        if ( comprobarHora() == false){
            return;
        }

        // Tiene que ser un usuario valido (logueado)
        alumnoLogueado = alumnosLogeados.find(e => (e.socketid == socket.id));
        if ( alumnoLogueado == null ){
            return; // No está conectado
        }

        // Buscar la pregunta, hay varias por cada posición para que no sea siempre la misma
        preguntasSeleccionadas = preguntas.filter(e => (e.posicion == alumnoLogueado.pregunta));

        // Dentro de las preguntas de la misma posición generar un aleatorio
        var indiceAleatorio = Math.floor(Math.random() * preguntasSeleccionadas.length);
        pregunta = preguntasSeleccionadas[indiceAleatorio];

        preguntaEnviar = {
            indiceEnArray : preguntas.indexOf(pregunta),
            prepregunta: pregunta.prepregunta,
            pregunta: pregunta.pregunta,
            respuesta: pregunta.respuesta,
        }

        // actualizar la preguntas que le tocaría al alumno
        alumnoLogueado.pregunta++
        // Si llega a la última se reinicia
        if ( alumnoLogueado.pregunta > ultimaPosicionPreguntas ){
            alumnoLogueado.pregunta = 1;
        }


        // enviar
        socket.emit('pregunta',preguntaEnviar);

    });


    socket.on('respuesta', (msg) => {
        if ( comprobarHora() == false){
            return;
        }

        // Tiene que ser un usuario valido (logueado)
        alumnoLogueado = alumnosLogeados.find(e => (e.socketid == socket.id));
        if ( alumnoLogueado == null ){
            return; // No está conectado
        }

        // actualizar en alumnoLogueado la última pregunta enviada
        pregunta = preguntas[msg.indiceEnArray];

        // buscar si esta entre las respuestas correctas
        var correcta = -1;
        var respuestasCorrectas = pregunta.respuesta.split("@"); // Puede ser más de una separada por ,
        for (var i=0; i < respuestasCorrectas.length; i++){
            var similarity = stringSimilarity.compareTwoStrings(quitarAcentos(respuestasCorrectas[i].toLowerCase()), quitarAcentos(msg.respuesta.toLowerCase()));
            if (similarity >= 0.75 ){
                correcta = 1;
            }
        }

        if ( correcta == 1){
            // Enviar un cambio en el tiempo.
            guardarRespuestaAlumno(alumnoLogueado.nombre,msg.indiceEnArray,pregunta.pregunta,msg.respuesta,1)
            alumnoLogueado.tiempo = alumnoLogueado.tiempo - tiempoBonificacionPregunta;
            socket.emit('respuesta', {
                resultado : true,
                tiempo: alumnoLogueado.tiempo
            });
        } else {
            // Enviar un cambio en el tiempo.
            guardarRespuestaAlumno(alumnoLogueado.nombre,msg.indiceEnArray,pregunta.pregunta,msg.respuesta,-1)
            socket.emit('respuesta',{
                resultado : false,
            });
        }

    });

});



// Carga de datos
// Alumnos
fs.createReadStream("alumnos.csv")
    .pipe(parse({delimiter: ';'}))
    .on('data', function(csvrow) {
        alumnos.push({
            nombre:csvrow[0],
            password: csvrow[1],
            color: csvrow[2]
        });
    })
    .on('end',function() {

    });

fs.createReadStream("preguntas.csv")
    .setEncoding('UTF8')
    .pipe(parse({delimiter: ';'}))
    .on('data', function(csvrow) {
        ultimaPosicionPreguntas = csvrow[0]
        preguntas.push({
            posicion:csvrow[0],
            prepregunta:csvrow[1],
            pregunta: csvrow[2],
            respuesta: csvrow[3],
        });
    })
    .on('end',function() {

    });

function guardarRespuestaAlumno(nombreAlumno, indicePregunta, pregunta, respuestaAlumno, acertado){
    var fecha = new Date();
    data = nombreAlumno+";"+indicePregunta+";"+pregunta+";"+respuestaAlumno+";"+acertado+";"+fecha+"\n";
    fs.appendFile('respuestas.csv', data,'utf8', function(){});
}
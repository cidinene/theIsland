
const serverGameElements = {
    alumnos: [],
    preguntas: [],
    ultimaPosicionPreguntas:0,
    alumnosLogeados:[],
    marineros: [],
    tiburones:[],
    barcos:[],
    init:function(alumnosP, preguntasP,ultimaPosicionPreguntasP,alumnosLogeadosP,marinerosP,tiburonesP,barcosP)
    {
        this.alumnos=alumnosP;
        this.preguntas=preguntasP;
        this.ultimaPosicionPreguntasP=ultimaPosicionPreguntasP;
        this.alumnosLogeados=alumnosLogeados;
        this.marineros= marinerosP;
        this.tiburones=tiburonesP;
        this.barcos=barcosP;
 
    }
    };
function timeUpdate(serverData)
    {
        if (undefined != serverData  && serverData.alumnosLogeados.length >0)
         {
            console.log("alumnosLogeados >0");
         }
         console.log("timeUpdate");
         
    }
export {serverGameElements, timeUpdate};
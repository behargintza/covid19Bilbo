/*
Definimos la funcion que funcionara como navegador WEB que nos permita extraer 
información de OPEN DATA disponible en la RED
*/
var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }
screenX
        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
    }
}

/*
Generamos el Array de datos 'datos' que servira para contener la información que posteriormente
se empleará para graficar. Es un Array de Arrays.
*/

var datos = [['Fecha']]
console.log(datos[0]);

/* Generamos un cliente del protocolo HTTP para conectarnos a una URL OPEN DATA y descargar la
información por zonas de salud en formato JSON
*/
var client = new HttpClient();
client.get('https://opendata.euskadi.eus/contenidos/ds_informes_estudios/covid_19_2020/opendata/aggregated/json/osasun_eremuak-zonas_salud-by_date.json', function(response) {

//Convertimos los datos en formato OBJEJO JSON para facilitar su tratamiento
    var data=JSON.parse(response);
    
    console.log(data.positiveCountByDate.byDimension)
    
/*
Recorremos los datos en el formato JSON para recoger información de aquellas zonas de Salud que nos interesan. En este caso
Karmelo y Txurdinaga. Generamos una estructura de arrays de arrays que permitirá luego ser cargado en las funciones
de Google Chart.
*/
   //Recorremos todas las zonas de salud
    var zonasSalud =0;
    for ( i in data.positiveCountByDate.byDimension)  {
       infoZona = data.positiveCountByDate.byDimension[i]
        console.log('i:'+infoZona.dimension.oid);
        /*Si es una zona de nuestro interés '2320' Txurdinaga - '2317' Karmelo' las tratamos. Almacenamos el nombre en la zona
        que será la cabecera de los datos*/
        console.log(infoZona.dimension.oid);
       if (infoZona.dimension.oid.id =='2320' ||
           infoZona.dimension.oid.id =='2317' ||
           infoZona.dimension.oid.id =='2313' ||
           infoZona.dimension.oid.id =='2318'){
          zonasSalud +=1;
          console.log(infoZona.dimension.nameByLang.BASQUE);
          datos[0].push(infoZona.dimension.nameByLang.BASQUE);
          for (j in infoZona.byDate) {
              z=parseInt(j)+1;
              //Si es la primera vez que recorre las fechas tenemos que generar nuevos arrays para las fechas
              if(zonasSalud==1){
                  datos.push([]);
                  datos[z].push(infoZona.byDate[j].date.substring(0,10));
              }
              if (infoZona.byDate[j].value<1000)
              datos[z].push(infoZona.byDate[j].value);
              else 
                datos[z].push(null);
          }
       }
   }
   console.log(datos[0]);
   datos_volteados = [];
   for (i in datos) {
        console.log('Fila: '+i);
        if (i!=0)
            datos_volteados.unshift(datos[i]);
   }
   console.log(datos);
   datos_volteados.unshift(datos[0]);
//    datos_volteados = [];
//    Como los datos están ordenados de más reciente a menos reciente, vamos a darles lavuelta
//    for ( i in datos)
//        datos_volteados.push(datos[i]);
});
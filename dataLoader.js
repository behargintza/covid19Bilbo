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
Karmelo , Otxarkoaga, Solokoetxe y  Txurdinaga. Generamos una estructura de arrays de arrays que permitirá luego ser cargado en las funciones
de Google Chart.
*/
   //Recorremos todas las zonas de salud
    var zonasSalud =0;
    for ( i in data.positiveCountByDate.byDimension)  {
       infoZona = data.positiveCountByDate.byDimension[i]
        /*Si es una zona de nuestro interés '2320' Txurdinaga - '2317' Karmelo' las tratamos. Almacenamos el nombre en la zona
        que será la cabecera de los datos*/
        console.log(infoZona.dimension.oid);
       if (infoZona.dimension.oid.id =='2320' ||
           infoZona.dimension.oid.id =='2317' ||
           infoZona.dimension.oid.id =='2313' ||
		   infoZona.dimension.oid.id =='2109' ||
           infoZona.dimension.oid.id =='2318'){
          zonasSalud +=1;
          datos[0].push(infoZona.dimension.nameByLang.BASQUE);
          for (j in infoZona.byDate) {
              z=parseInt(j)+1;
              
              //Si es la primera vez que recorre las fechas tenemos que generar nuevos arrays para las fechas
              if(zonasSalud==1){
                  datos.push([]);
                  datos[z].push(infoZona.byDate[j].date.substring(0,10));
              }
              
              // Limpieza del fichero, en ocasiones se muestra la población total en lugar de todos los infectados. Si no hay datos válidos
              // se marcan a null.
              if (infoZona.byDate[j].value<1000)
              datos[z].push(infoZona.byDate[j].value);
              else 
                datos[z].push(null);
          }
       }
   }
   
   /* Los datos se han ido cargando de más actuales a más antiguos y para visualizarlos los requerimos en orden contrario. Por ello,
      esta función voltea los datos para organizarlos de la forma requerida.
   */
   datos_volteados = [];
   for (i in datos) {
        console.log('Fila: '+i);
        if (i!=0)
            datos_volteados.unshift(datos[i]);
   }
        // Se añade la cabecera indicando que datos son al comienzo del array.
   datos_volteados.unshift(datos[0]);
    
   /* Para dibujar la gráfica se genera una estructura de tablas, array de 2 dimensiones. Generamos la estructura requerida para
      la información del último día disponible en el array de datos datos_volteados. El formato de los datos era
      
      [['Barrio, 'Positivos'],
        ['Karmelo',12],
             ...      ,
        ['Txurdinaga',1]
       ]
   */
   datosPie =[['Barrio','Positivos']];
   for (var i = 1; i < datos[0].length; i++) {
        datosPie.push([datos_volteados[0][i],datos_volteados[datos.length-1][i]]);
}
   
});
/* Configuración para el funcionamiento de Google Chart: carga y establece la función a cargar*/
              google.charts.load('current', {'packages':['corechart']});
              google.charts.setOnLoadCallback(drawChart);
                
              // Se define la función que cargará los gráficos en la página HTML
              function drawChart() {
                  
                // carga los datos en los formatos requeridos por Google Chart. Cada gráfica los suyos.
                var data = google.visualization.arrayToDataTable(datos_volteados);
                var dataPie = google.visualization.arrayToDataTable(datosPie);

                // Se configuran las opciones esppecíficas de cada título
                var options = {
                  title: 'POSITIVOS COVID-19 BARRIOS BILBAO', //Titulo del gráfico
                  curveType: 'function',                      //Tipo de curva redondeada
                  legend: {position: 'right', textStyle: {color: 'black', fontSize: 16},alignment:'center'}, // Posicionado y tipo de leyenda
                  hAxis: { // Se indica propiedades del eje horizontal (nombre Fechas)
                    title: 'Fechas'
                   },
                  vAxis: { //Se indican propiedades del eje vertical ( nombre: Número de Positivos)
                    title: 'Número de Positivos',
                  },
                  colors: ['#a52714', '#097138','#0200F8','#C3E314','#223311'], //Colores de las series
                  backgroundColor:'#fff8dc', // Color de fondo idéntico al de la página HTML
                  pointShape:'diamond', // Se indica el símbolo que represetnaran los puntos de datos y su tamaño
                  pointSize:5,
                };
                  
                var optionsPie = {
                  title: 'DISTRIBUCIÓN COVID-19 BARRIOS A FECHA '+datos_volteados[datos_volteados.length-1][0], // Cargamos Titulo con Fecha Datos
                  colors: ['#a52714', '#097138','#0200F8','#C3E314','#223311'], //Colores de las series,mismo que el anterior
                  backgroundColor:'#fff8dc', // Color de fondo idéntico al de la página HTML
                  legend: {position: 'right', textStyle: {color: 'black', fontSize: 16},alignment:'center'},// Posicionado y tipo de leyenda
                  slices: {  0: {offset: 0.1},  }, // Destacamos la información del primer trozo: Karmelo
                  pieStartAngle:60,  // Giramos la gráfica 60º para que el trozo destacado quede a la derecha


                };
              
                // Se genern los objetos
                var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
                var chartPie = new google.visualization.PieChart(document.getElementById('piechart'));
                
                // Se llama a la función de visualizar de los objetos indicandoles los datos y la configuración.
                chart.draw(data, options);
                chartPie.draw(dataPie, optionsPie);
      }

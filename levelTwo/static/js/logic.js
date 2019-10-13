// Create two variable to hold the geojson data url.
var url="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"; //eatrhquake
var url2="https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"; //boundaries

// create two arrays to hold the labels and colors for the legend. 
var grade=["0-1","1-2","2-3","3-4","4-5","5+"]; //labels
var colorArray=["#6AFF00","#D4FF00","#F7FF00","#FFD300","#FF8C00","#FF0000"]; //colors

//Create a function to assign a color to a range of magnitude. To be used inside the function of pointToLayer option
function getColor(feature){
    if (feature["properties"]["mag"]<1) {return colorArray[0];} //0-1
    else if (feature["properties"]["mag"]>=1 && feature["properties"]["mag"]<2) {return colorArray[1];} //1-2
    else if (feature["properties"]["mag"]>=2 && feature["properties"]["mag"]<3) {return colorArray[2];} //2-3
    else if (feature["properties"]["mag"]>=3 && feature["properties"]["mag"]<4) {return colorArray[3];} //3-4
    else if (feature["properties"]["mag"]>=4 && feature["properties"]["mag"]<5) {return colorArray[4];} //4-5
    else {return colorArray[5];} //5+
     };

// Create an onEachFeature function to bind pop-up. To be used in onEachFeature option of L.geoJSON
function onEachFeature(feature, layer) {
        if (feature.properties) {
            layer.bindPopup(`<h3 align="center">${feature.properties.place}</h3><hr><h3 align="center">Magnitude: ${feature.properties.mag}</h3>`
            )};
    };

// Use d3.json to access the geojson data    
d3.json(url, function(data){
    // Use d3.json to access the boundary data
    d3.json(url2, d=>{
        // Create a layer of boundary
        var boundary=L.geoJSON(d);
        // Create  base layers and add to map
        //street layer
        var streets=L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery � <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: apiKey
        });
        // satellite layer
        var satellite=L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery � <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.satellite',
        accessToken: apiKey
        });
        // dark layer
        var dark=L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery � <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.dark',
        accessToken: apiKey
        });
        
    // Create earthquake layer
    var earthquakes=L.geoJSON(data, {
        // create circles
        pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: feature["properties"]["mag"]*4,
                    fillColor: getColor(feature), // use the function defined above to assign to a color based on magnitude
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8}); 
        },
        // bind pop-up
        onEachFeature: onEachFeature // use the function defined above
    });
    
    // Create the legend
    var legend = L.control({position:"bottomright"}); //Specify the location of the legend on the map
    legend.onAdd=function(map){
        var div=L.DomUtil.create("div","info legend"); //Add a div tag and set class to info and legend
        //Create two unordered lists to display labels and colors next to each other (css: inline-block)
        // Create list for labels
        var texts=[];
        grade.forEach(d=> {
            texts.push(`<li>${d}</li>`)
        });           
        div.innerHTML =`<h4 align="center">Magnitude</h4><ul>${texts.join('')}</ul>` ; //Insert ul list to div created above
        // Create list for colors
        var labels = [];                                           
        colorArray.forEach(d=> {
            labels.push(`<li style="background-color:${d}"></li>`)
        });
        div.innerHTML += `<ul>${labels.join('')}</ul>`;
        return div;               
    }
    // Create baseMaps object
    var baseMaps={
        Streets: streets,
        Dark: dark,
        Satellite: satellite
    };
    
    // Create overlayMaps object
    var overlayMaps={
        Earthquakes:earthquakes,
        Boundaries:boundary
    };
    
    // Create a map
    var mymap = L.map('map', {
        center: [34.05223, -118.24368],
        zoom: 3,
        layers:[streets,earthquakes] // set default layers to streets and earthquake
    });
    // Create control to display layers in the map
    L.control.layers(baseMaps, overlayMaps).addTo(mymap);
    legend.addTo(mymap); //Add legend to map

    });
});
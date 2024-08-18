function getColor(depth) {
    return depth > 90 ? '#d73027' :
           depth > 70 ? '#fc8d59' :
           depth > 50 ? '#fee08b' :
           depth > 30 ? '#d9ef8b' :
           depth > 10 ? '#91cf60' :
                        '#1a9850';
}

function createMap(data) {
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    let circleArray = [];

    for (let i = 0; i < data.length; i++) {
        let row = data[i];
        let location = row.geometry;
        let depth = location.coordinates[2];

        if (location) {
            let point = [location.coordinates[1], location.coordinates[0]];

            let circleMarker = L.circle(point, {
                fillOpacity: 0.75,
                color: getColor(depth),
                fillColor: getColor(depth),
                radius: row.properties.mag * 20000
            }).bindPopup(`<h3>${row.properties.title}</h3><hr><p>Magnitude: ${row.properties.mag}<br>Depth: ${depth} km</p>`);

            circleArray.push(circleMarker);
        }
    }

    let circleLayer = L.layerGroup(circleArray);

    let baseLayers = {
        "Street Map": street,
        "Topographic Map": topo
    };

    let overlayLayers = {
        "Earthquakes": circleLayer
    };

    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 4,
        layers: [street, circleLayer]
    });

    L.control.layers(baseLayers, overlayLayers).addTo(myMap);

    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 30, 50, 70, 90],
            labels = [];

        // Debugging: Check if colors are being generated
        console.log("Legend Colors:");
        for (let i = 0; i < grades.length; i++) {
            let color = getColor(grades[i] + 1);
            console.log(`Grade: ${grades[i]}, Color: ${color}`);

            div.innerHTML +=
                '<i style="background:' + color + '; width: 18px; height: 18px; display: inline-block;"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);

    // Force a manual update to the legend
    myMap.on('layeradd', function() {
        legend._update();
    });
}

function doWork() {
    let earthquakeDataUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

    d3.json(earthquakeDataUrl).then(function (data) {
        let data_rows = data.features;
        createMap(data_rows);
    });
}

doWork();


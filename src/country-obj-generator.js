var $ = require("jquery");
var fs = require('fs');
var THREE = require('three');
var radius = 5;

function getVertex(longitude, latitude){
    const lambda = longitude * Math.PI / 180;
    const phi = latitude * Math.PI / 180;
    return new THREE.Vector3(
      radius * Math.cos(phi) * Math.cos(-lambda),
      radius * Math.sin(phi),
      radius * Math.cos(phi) * Math.sin(-lambda)
    );
  }

function loadGeoJsonData(data){
    for (let feature of data["features"]) {
      let countryName = feature["properties"]["ADMIN"];
      let outObject3d = new THREE.Object3D();
      let counter = 0;
      console.log(countryName);
      if(countryName == "Italy" || true){
        for (let entry of feature["geometry"]["coordinates"]) {
          for (let entry2 of entry) {
            const geometry = new THREE.Geometry();
            for (let entry3 of entry2) {
              const vertex = getVertex(entry3[0], entry3[1]);
              geometry.vertices.push(vertex);
            }
            const material = new THREE.LineBasicMaterial( {
              color: 0xffffff,
              linewidth: 1,
              linecap: 'butt', //ignored by WebGLRenderer
              linejoin:  'round' //ignored by WebGLRenderer
            } );
            const mesh = new THREE.Line(geometry, material);
            mesh.name = counter + "_" + countryName;
            counter++;
            outObject3d.add(mesh);
          }
        }
        const OBJExporter = require('three-obj-exporter');
        const exporter = new OBJExporter();
        const result = exporter.parse(outObject3d);
        fs.writeFileSync('./flatobj/' + countryName + '.obj', result);
      }
    }
  }

function loadGeoJson(){
    let rawdata = fs.readFileSync('./geo-countries-master/data/countries.geojson');
    let data = JSON.parse(rawdata);
    loadGeoJsonData(data);
}

console.log("hello");
loadGeoJson();
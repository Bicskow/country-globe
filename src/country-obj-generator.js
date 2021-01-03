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

function exportGeoJsonData(data, folderName){
    for (let feature of data["features"]) {
      let geomType = feature["geometry"]["type"]
      let countryName = feature["properties"]["admin"] || feature["properties"]["ADMIN"];
      let outObject3d = new THREE.Object3D();
      let counter = 0;
      console.log(countryName);
      if(countryName == "Hungary" || true){
        let coordinates = feature["geometry"]["coordinates"];
        if(geomType === "Polygon"){
          coordinates = [feature["geometry"]["coordinates"]];
        }
        for (let entry of coordinates) {
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
        let resultFixed = "";
        let lines = result.trim().split("\n");
        for(var i = 0; i < lines.length; i++){
          if(lines[i].startsWith('l')){
            vcs = lines[i].trim().split(' ');
            let fixedLine = vcs[0] + " " + vcs[1];
            for(var k = 2; k < vcs.length; k++){
              if(k != (vcs.length - 1)){ 
                fixedLine += " " + vcs[k] + " " + vcs[k];
              } else {
                fixedLine += " " + vcs[k].trim() + " " + vcs[1];
              }
            }
            resultFixed += fixedLine + "\n";
          } else {
            resultFixed += lines[i] + "\n";
          }
        }
        fs.writeFileSync(`./flatobj/${folderName}/${countryName}.obj`, resultFixed);
      }
    }
  }

function exportGeoJson(folderName){
    let rawdata = fs.readFileSync(`./geojson-regions/countries/${folderName}/all.geojson`);
    let data = JSON.parse(rawdata);
    exportGeoJsonData(data, folderName);
}

console.log("hello");
exportGeoJson('110m');
exportGeoJson('50m');
exportGeoJson('10m');
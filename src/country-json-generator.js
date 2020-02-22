var fs = require('fs');
var path = require('path');
// In newer Node.js versions where process is already global this isn't necessary.
var process = require("process");

var foler = "./flatobj";

let rawdata = fs.readFileSync('./countryData/countries.json');
let countryData = JSON.parse(rawdata);
//console.log(countryData);

// Loop through all the files in the temp directory
fs.readdir(foler, function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  var countries = new Object();
  files.forEach(function (file, index) {
    let key = file.replace(".obj", "");
    countries[key] = new Object();
    countries[key]["fileName"] = file;
    countries[key]["lat"] = getCoordinates(countryData, key)[0];
    countries[key]["lng"] = getCoordinates(countryData, key)[1];
    countries[key]["zoom"] = 75;

  });
  //console.log(countries);
  var myJSON = JSON.stringify(countries, null, 4);
  console.log(myJSON);
  fs.writeFile('./resources/countries.json', myJSON, function(err, result) {
    if(err) console.log('error', err);
  });
});


function getCoordinates(countryData, country){
  for(data of countryData){
    if(country === data['name'])
      return data['latlng'];
  }
  return ["?", "?"];
}

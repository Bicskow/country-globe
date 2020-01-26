var fs = require('fs');
var path = require('path');
// In newer Node.js versions where process is already global this isn't necessary.
var process = require("process");

var foler = "./flatobj";


// Loop through all the files in the temp directory
fs.readdir(foler, function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  var countries = new Object();
  files.forEach(function (file, index) {
    countries[file.replace(".obj", "")] = file;
  });
  //console.log(countries);
  var myJSON = JSON.stringify(countries, null, 4);
  console.log(myJSON);
  fs.writeFile('./resources/countries.json', myJSON, function(err, result) {
    if(err) console.log('error', err);
  });
});

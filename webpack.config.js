const serverConfig = {
	entry: ["./dist/country-globe.js"],
    output: {
		filename: 'country-globe-node.js',
		path: __dirname + '/dist',
	  },
	target: 'node'
};

const clientConfig = {
	entry: ["./dist/country-globe.js"],
    output: {
		filename: 'country-globe-web.js',
		path: __dirname + '/dist',
		library: 'CountryGlobe',
		libraryTarget: 'var',
	  },
	target: 'web'
};

module.exports = [ serverConfig, clientConfig ];
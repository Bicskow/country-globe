#Country Globe

Country Globe is a web component to display and highlight countries on a 3D globe.
The project uses ThreeJS/WebGL for 3D rendering

<p align="center">
   <a href="https://bicskow.github.io/country-globe/examples/"><img width="48%" src="https://bicskow.github.io/country-globe/examples/country_globe.png"></a>
</p>

##Quick Start

```
<div id="container"></div>
<script src="/js/country-globe-web.js"></script>
<script>
    var container = document.getElementById('container');
    var cg = new CountryGlobe(container);
</script>
```

##Features
- Highlight a country on the globe
- Rotate the globe to show a specific country
- Rotate and zoom with mouse
- Detect which country is clicked by the user

##License

All source code is licensed under the [MIT licence][mit].


[mit]: https://opensource.org/licenses/MIT
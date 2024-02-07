//please use your own Mapbox token - just follow the instructions on their website
mapboxgl.accessToken = "";

//variables (var) up the top
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/streets-v12", // stylesheet location
  center: [-72.63424, 42.31168],
  zoom: 3, // starting zoom,
  maxZoom: 10,
  minZoom: 3,
  antialias: true,
  pitch: 0,
  projection: "globe",
});

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, "top-left");

map.on("load", () => {
  map.addSource("link_companies", {
    type: "geojson",
    data: "static/data/links_companies.geojson",
  });

  map.addLayer({
    id: "Link - Companies",
    type: "line",
    source: "link_companies",
    layout: {
      "line-join": "round",
      "line-cap": "round",
      visibility: "visible",
    },
    paint: {
      "line-color": "orange",
      "line-width": 1,
    },
  });

  map.addSource("link_k-12", {
    type: "geojson",
    data: "static/data/links_k-12.geojson",
  });

  map.addLayer({
    id: "Link - K-12 Experiment Sites",
    type: "line",
    source: "link_k-12",
    layout: {
      "line-join": "round",
      "line-cap": "round",
      visibility: "visible",
    },
    paint: {
      "line-color": "magenta",
      "line-width": 1,
    },
  });

  map.loadImage("static/house.png", (error, image) => {
    if (error) throw error;
    map.addImage("RTE-marker", image);

    map.addSource("icons_RTE", {
      type: "geojson",
      data: "static/data/icons_RTE.geojson",
    });

    map.addLayer({
      id: "Point - RTE Headquarter",
      type: "symbol",
      source: "icons_RTE",
      layout: {
        "icon-image": "RTE-marker",
        "icon-size": 0.1,
        visibility: "visible",
        // get the title name from the source's "title" property
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-offset": [0, 1.25],
        "text-anchor": "top",
      },
    });
  });

  map.loadImage("static/plant.png", (error, image) => {
    if (error) throw error;
    map.addImage("companies-marker", image);

    map.addSource("icons_companies", {
      type: "geojson",
      data: "static/data/icons_companies.geojson",
    });

    map.addLayer({
      id: "Point - Companies",
      type: "symbol",
      source: "icons_companies",
      layout: {
        "icon-image": "companies-marker",
        "icon-size": 0.1,
        visibility: "visible",
        // get the title name from the source's "title" property
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-offset": [0, 1.25],
        "text-anchor": "top",
      },
    });
  });

  map.loadImage("static/gardening.png", (error, image) => {
    if (error) throw error;
    map.addImage("k-12-marker", image);

    map.addSource("icons_k-12", {
      type: "geojson",
      data: "static/data/icons_k-12.geojson",
    });

    map.addLayer({
      id: "Point - K-12 Experiment Sites",
      type: "symbol",
      source: "icons_k-12",
      layout: {
        "icon-image": "k-12-marker",
        "icon-size": 0.1,
        visibility: "visible",
        // get the title name from the source's "title" property
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-offset": [0, 1.25],
        "text-anchor": "top",
      },
    });
  });

  map.on("idle", () => {
    // If these two layers were not added to the map, abort
    if (
      !map.getLayer("Link - Companies") ||
      !map.getLayer("Link - K-12 Experiment Sites") ||
      !map.getLayer("Point - RTE Headquarter") ||
      !map.getLayer("Point - Companies") ||
      !map.getLayer("Point - K-12 Experiment Sites")
    ) {
      return;
    }

    // Enumerate ids of the layers.
    const toggleableLayerIds = [
      "Link - Companies",
      "Link - K-12 Experiment Sites",
      "Point - RTE Headquarter",
      "Point - Companies",
      "Point - K-12 Experiment Sites",
    ];

    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
      // Skip layers that already have a button set up.
      if (document.getElementById(id)) {
        continue;
      }

      // Create a link.
      const link = document.createElement("a");
      link.id = id;
      link.href = "#";
      link.textContent = id;
      link.className = "active";

      // Show or hide layer when the toggle is clicked.
      link.onclick = function (e) {
        const clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        const visibility = map.getLayoutProperty(clickedLayer, "visibility");

        // Toggle layer visibility by changing the layout object's visibility property.
        if (visibility === "visible") {
          map.setLayoutProperty(clickedLayer, "visibility", "none");
          this.className = "";
        } else {
          this.className = "active";
          map.setLayoutProperty(clickedLayer, "visibility", "visible");
        }
      };

      const layers = document.getElementById("menu");
      layers.appendChild(link);
    }
  });

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  map.on("mouseenter", "Point - Companies", (e) => {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = "pointer";

    // Copy coordinates array.
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.description;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(coordinates).setHTML(description).addTo(map);
  });

  map.on("mouseleave", "Point - Companies", () => {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });
});

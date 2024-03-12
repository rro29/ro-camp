(() => {
    const parsedCamp = JSON.parse(campground);
    const coords = parsedCamp.geometry.coordinates;
    
    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/dark-v11', // style URL
        center: coords, // starting position [lng, lat]
        zoom: 12, // starting zoom
    });
    
    map.addControl(new mapboxgl.NavigationControl({
        visualizePitch: true
    }));
    map.scrollZoom.disable();

    const popup = new mapboxgl.Popup().setHTML(`
        <h3>${parsedCamp.title}</h3>
        <p>${parsedCamp.location}</p>
    `);

    // Create a marker and add it to the map.
    new mapboxgl.Marker({color: 'purple'}).setLngLat(coords).setPopup(popup).addTo(map);
})()
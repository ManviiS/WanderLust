
    // TO MAKE THE MAP APPEAR YOU MUST
    // ADD YOUR ACCESS TOKEN FROM
    // https://account.mapbox.com
    /* let mapToken=mapToken;
    console.log(mapToken); */
  
    mapboxgl.accessToken = mapToken;
    // const coordinates = listing.geometry.coordinates;
    const coordinates = [listing.geometry.coordinates[0], listing.geometry.coordinates[1]];
    const map = new mapboxgl.Map({
        container: "map", // container ID
        style:"mapbox://styles/mapbox/streets-v12",
        center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 // starting zoom
    });
    const marker=new mapboxgl.Marker({color:"red"})
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl.Popup({offset:25}).setHTML(
           ` <h4>${listing.title}</h4>
            <p>exact location will be provided after booking</p>`
        )
    )
    .addTo(map);
  
   
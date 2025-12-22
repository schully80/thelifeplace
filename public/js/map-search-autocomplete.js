(function () {
  let map, marker, autocomplete, geocoder;

  function initMap() {
    const mapEl = document.getElementById("map");
    const inputEl = document.getElementById("map-search-input");
    if (!mapEl || !inputEl || !window.google) return;

    geocoder = new google.maps.Geocoder();

    map = new google.maps.Map(mapEl, {
      center: { lat: -26.2041, lng: 28.0473 },
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
    });

    marker = new google.maps.Marker({
      map,
      draggable: true,
      title: "Drag to adjust location",
    });

    autocomplete = new google.maps.places.Autocomplete(inputEl, {
      fields: ["address_components", "geometry", "place_id", "formatted_address"],
      componentRestrictions: { country: "ZA" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.address_components) return;

      const location = place.geometry.location;
      map.setCenter(location);
      marker.setPosition(location);

      fillFields(place);
    });

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (!pos) return;
      geocoder.geocode({ location: pos }, (results, status) => {
        if (status === "OK" && results[0]) {
          fillFields(results[0]);
        }
      });
    });
  }

  function fillFields(place) {
    const comps = place.address_components || [];
    const byType = (type) =>
      comps.find((c) => c.types.includes(type))?.long_name || "";

    const streetNumber = byType("street_number");
    const streetName = byType("route");
    const suburb =
      byType("sublocality_level_1") ||
      byType("sublocality") ||
      byType("neighborhood") ||
      byType("administrative_area_level_3");
    const city = byType("locality") || byType("administrative_area_level_2");
    const postal = byType("postal_code");

    document.getElementById("street_number")?.value = streetNumber;
    document.getElementById("street_name")?.value = streetName;
    document.getElementById("suburb")?.value = suburb;
    document.getElementById("city")?.value = city;
    document.getElementById("postal_code")?.value = postal;
    document.getElementById("place_id")?.value = place.place_id || "";
    document.getElementById("latitude")?.value = place.geometry?.location?.lat();
    document.getElementById("longitude")?.value = place.geometry?.location?.lng();
  }

  window.addEventListener("load", () => {
    if (window.google && window.google.maps) initMap();
    else {
      const iv = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(iv);
          initMap();
        }
      }, 200);
    }
  });
})();
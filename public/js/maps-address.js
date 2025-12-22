(function () {
  let map, marker, geocoder;

  function init() {
    const mapEl = document.getElementById("map");
    if (!mapEl || !window.google) return;

    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(mapEl, {
      center: { lat: -26.2041, lng: 28.0473 }, // Johannesburg CBD
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
    });

    marker = new google.maps.Marker({
      position: map.getCenter(),
      map,
      draggable: true,
      title: "Drag to pinpoint location",
    });

    // On drag end, reverse geocode and fill fields
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (!pos) return;
      document.getElementById("latitude").value = pos.lat();
      document.getElementById("longitude").value = pos.lng();

      geocoder.geocode({ location: pos }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          fillFromGeocode(results[0]);
        }
      });
    });
  }

  function fillFromGeocode(result) {
    const comps = result.address_components || [];
    const byType = (type) =>
      comps.find((c) => c.types.includes(type))?.long_name || "";

    // Street number/name may come as part of route + street_number
    const streetNumber = byType("street_number");
    const streetName = byType("route");
    const suburb =
      byType("sublocality_level_1") ||
      byType("sublocality") ||
      byType("neighborhood") ||
      byType("administrative_area_level_3");
    const city = byType("locality") || byType("administrative_area_level_2");
    const postal = byType("postal_code");

    const fields = {
      street_number: document.getElementById("street_number"),
      street_name: document.getElementById("street_name"),
      suburb: document.getElementById("suburb"),
      city: document.getElementById("city"),
      postal: document.getElementById("postal_code"),
      place_id: document.getElementById("place_id"),
    };

    if (fields.street_number && streetNumber) fields.street_number.value = streetNumber;
    if (fields.street_name && streetName) fields.street_name.value = streetName;
    if (fields.suburb) {
      if (suburb) fields.suburb.value = suburb;
      else fields.suburb.removeAttribute("readonly"); // unlock if missing
    }
    if (fields.city) {
      if (city) fields.city.value = city;
      else fields.city.removeAttribute("readonly");
    }
    if (fields.postal) {
      if (postal) fields.postal.value = postal;
      else fields.postal.removeAttribute("readonly");
    }
    if (fields.place_id) fields.place_id.value = result.place_id || "";
  }

  // Run when Maps script is ready
  window.addEventListener("load", () => {
    if (window.google && window.google.maps) init();
    else {
      // Poll until script loads
      const iv = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(iv);
          init();
        }
      }, 200);
    }
  });
})();
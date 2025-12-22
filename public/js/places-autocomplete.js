(function () {
  const gmpx = document.getElementById("gmpx-autocomplete");
  const streetNameInput = document.getElementById("street_name");
  const suburbInput = document.getElementById("suburb");
  const cityInput = document.getElementById("city");
  const postalInput = document.getElementById("postal_code");
  const placeIdInput = document.getElementById("place_id");
  const latInput = document.getElementById("latitude");
  const lngInput = document.getElementById("longitude");

  if (!gmpx || !streetNameInput) return;

  // Keep component in sync with visible field
  streetNameInput.addEventListener("input", (e) => {
    gmpx.value = e.target.value;
  });

  // Autocomplete selection → populate fields
  gmpx.addEventListener("gmpx-placechange", (evt) => {
    const place = evt.detail?.place;
    if (!place || !place.address_components) return;

    const byType = (type) =>
      place.address_components.find((c) => c.types.includes(type))?.long_name || "";

    const streetNumber = byType("street_number");
    const streetName = byType("route");
    const suburb =
      byType("sublocality_level_1") ||
      byType("sublocality") ||
      byType("neighborhood") ||
      byType("administrative_area_level_3");
    const city = byType("locality") || byType("administrative_area_level_2");
    const postal = byType("postal_code");

    // Fill fields and unlock if missing
    const streetNumEl = document.getElementById("street_number");
    if (streetNumEl && streetNumber) streetNumEl.value = streetNumber;
    if (streetNameInput && (streetName || place.name || place.formatted_address)) {
      streetNameInput.value = streetName || place.name || place.formatted_address;
    }

    if (suburbInput) {
      if (suburb) suburbInput.value = suburb;
      else suburbInput.removeAttribute("readonly");
    }
    if (cityInput) {
      if (city) cityInput.value = city;
      else cityInput.removeAttribute("readonly");
    }
    if (postalInput) {
      if (postal) postalInput.value = postal;
      else postalInput.removeAttribute("readonly");
    }

    if (placeIdInput) placeIdInput.value = place.place_id || "";
    if (latInput && lngInput && place.geometry?.location) {
      latInput.value = place.geometry.location.lat();
      lngInput.value = place.geometry.location.lng();
    }

    // Optional: nudge the map marker
    if (window.google && place.geometry?.location) {
      const map = window.__address_map__;
      const marker = window.__address_marker__;
      if (map && marker) {
        map.setCenter(place.geometry.location);
        marker.setPosition(place.geometry.location);
      }
    }
  });

  // Suburb search icon → switch to suburb-only mode
  const suburbFindBtn = document.getElementById("suburb-find");
  if (suburbFindBtn && suburbInput) {
    suburbFindBtn.addEventListener("click", () => {
      gmpx.value = ""; // clear previous query
      suburbInput.removeAttribute("readonly");
      suburbInput.focus();
      // Lightly hint the user to type suburb
      suburbInput.placeholder = "Type your suburb...";
      // If you want suburb-only suggestions, you can constrain by text and region; the component will filter broadly.
    });
  }

  // Expose map refs if created
  window.addEventListener("address:map-ready", (e) => {
    const { map, marker } = e.detail || {};
    window.__address_map__ = map;
    window.__address_marker__ = marker;
  });
})();
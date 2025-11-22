(function () {
  // Detect if this page has the Google Autocomplete field
  const addressInput = document.getElementById("address-autocomplete");
  if (!addressInput) return; // ⛔ No form with address → don't load Places API

  // Load Google Places API dynamically
  const script = document.createElement("script");
  script.src = "https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places";
  script.async = true;
  script.defer = true;

  script.onload = () => {
    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
      types: ["address"],
      componentRestrictions: { country: ["za"] },
      fields: ["address_components", "formatted_address"],
    });

    const componentMap = {
      sublocality: "long_name",
      locality: "long_name",
      administrative_area_level_1: "long_name",
      postal_code: "short_name",
      country: "long_name",
    };

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      place.address_components.forEach((comp) => {
        const type = comp.types[0];
        const el = document.getElementById(type);
        if (el && componentMap[type]) {
          el.value = comp[componentMap[type]];
        }
      });
    });
  };

  document.body.appendChild(script);
})();

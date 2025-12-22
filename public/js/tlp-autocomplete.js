document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("full_address");
  if (!input) return;

  function init() {
    const autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ["address_components", "formatted_address"],
      types: ["address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place || !place.address_components) return;

      const get = (type) =>
        place.address_components.find((c) => c.types.includes(type))?.long_name || "";

      // Fill fields
      document.getElementById("suburb").value =
        get("sublocality") || get("sublocality_level_1");

      document.getElementById("city").value = get("locality");
      document.getElementById("province").value =
        get("administrative_area_level_1");
      document.getElementById("postal_code").value = get("postal_code");
      document.getElementById("country").value = get("country");
    });
  }

  // Wait for Google
  let tries = 0;
  const wait = setInterval(() => {
    if (window.google?.maps?.places) {
      clearInterval(wait);
      init();
    }
    if (tries++ > 30) clearInterval(wait);
  }, 200);
});

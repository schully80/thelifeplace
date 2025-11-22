(function () {
  const input = document.getElementById("address-autocomplete-input");
  const gmpx = document.getElementById("gmpx-autocomplete");

  const fields = {
    suburb: document.getElementById("suburb"),
    city: document.getElementById("city"),
    province: document.getElementById("province"),
    postal: document.getElementById("postal_code"),
    country: document.getElementById("country"),
  };

  if (!input || !gmpx) return;

  input.addEventListener("input", (e) => {
    gmpx.value = e.target.value;
  });

  gmpx.addEventListener("gmpx-placechange", (evt) => {
    const place = evt.detail?.place;
    if (!place || !place.address_components) return;

    console.group("Google Place Debug");
    console.log("Formatted address:", place.formatted_address);
    place.address_components.forEach((c) =>
      console.log(`${c.long_name} [${c.types.join(", ")}]`)
    );
    console.groupEnd();

    const byType = (type) =>
      place.address_components.find((c) => c.types.includes(type))?.long_name || "";

    const suburb =
      byType("sublocality_level_1") ||
      byType("sublocality") ||
      byType("neighborhood") ||
      byType("administrative_area_level_3");
    const city =
      byType("locality") || byType("administrative_area_level_2");
    const province = byType("administrative_area_level_1");
    const postal = byType("postal_code");
    const country = byType("country");

    if (fields.suburb) fields.suburb.value = suburb;
    if (fields.city) fields.city.value = city;
    if (fields.province) fields.province.value = province;
    if (fields.postal) fields.postal.value = postal;
    if (fields.country) fields.country.value = country;

    input.value = place.formatted_address || place.name || input.value;
  });
})();
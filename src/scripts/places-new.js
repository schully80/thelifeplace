/* src/scripts/places-new.js
   Lightweight Google Places Autocomplete helper (bundled via Astro/Vite)

   Usage in HTML:
     <input id="address" data-places data-country="ZA" />
     <input id="city" data-places-city />
     <input id="state" data-places-state />
     <input id="postal" data-places-postal />
     <input id="country" data-places-country />
     <input id="lat" data-places-lat />
     <input id="lng" data-places-lng />
*/

/* global google */

(() => {
  const SELECTOR = '[data-places]';
  const DEFAULT_COUNTRY = 'ZA'; // bias; change/override via data-country
  const loadedFlag = '__tlpPlacesAttached__';

  // Map of Google component types -> target data- attribute
  const componentMap = {
    street_number: { attr: 'data-places-street-number', use: 'short_name' },
    route:         { attr: 'data-places-street',        use: 'long_name'  },
    locality:      { attr: 'data-places-city',          use: 'long_name'  },
    postal_town:   { attr: 'data-places-city',          use: 'long_name'  },
    sublocality:   { attr: 'data-places-sublocality',   use: 'long_name'  },
    administrative_area_level_1: { attr: 'data-places-state',   use: 'short_name' },
    administrative_area_level_2: { attr: 'data-places-county',  use: 'long_name'  },
    country:       { attr: 'data-places-country',       use: 'long_name'  },
    postal_code:   { attr: 'data-places-postal',        use: 'short_name' },
  };

  function $idOrAttr(root, attr) {
    // Prefer element with the data- attr; fallback to element whose id matches common names
    let el = root.querySelector(`[${attr}]`);
    if (el) return el;
    const fallbacks = {
      'data-places-street-number': '#street_number,#street-number',
      'data-places-street'       : '#route,#street,#address1,#address',
      'data-places-city'         : '#locality,#city,#town',
      'data-places-sublocality'  : '#sublocality',
      'data-places-state'        : '#administrative_area_level_1,#state,#province',
      'data-places-county'       : '#administrative_area_level_2,#county,#district',
      'data-places-country'      : '#country',
      'data-places-postal'       : '#postal_code,#postcode,#zip',
      'data-places-lat'          : '#lat,#latitude',
      'data-places-lng'          : '#lng,#longitude',
    };
    const sel = fallbacks[attr];
    return sel ? root.querySelector(sel) : null;
  }

  function clearTargets(root) {
    Object.values(componentMap).forEach(({ attr }) => {
      const el = $idOrAttr(root, attr);
      if (el) el.value = '';
    });
    const lat = $idOrAttr(root, 'data-places-lat');
    const lng = $idOrAttr(root, 'data-places-lng');
    if (lat) lat.value = '';
    if (lng) lng.value = '';
  }

  function fillComponents(root, place) {
    if (!place || !place.address_components) return;
    const comps = place.address_components;

    // Fill discrete fields
    comps.forEach(c => {
      const type = c.types[0];
      const map = componentMap[type];
      if (!map) return;
      const el = $idOrAttr(root, map.attr);
      if (el) el.value = c[map.use] || '';
    });

    // Lat/Lng
    const latEl = $idOrAttr(root, 'data-places-lat');
    const lngEl = $idOrAttr(root, 'data-places-lng');
    if (place.geometry && place.geometry.location && latEl && lngEl) {
      const loc = place.geometry.location;
      latEl.value = (typeof loc.lat === 'function' ? loc.lat() : loc.lat) || '';
      lngEl.value = (typeof loc.lng === 'function' ? loc.lng() : loc.lng) || '';
    }
  }

  function attachAutocomplete(input) {
    if (!input || input[loadedFlag]) return;
    input[loadedFlag] = true;

    // Prevent Enter from prematurely submitting forms while choosing a place
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') e.preventDefault();
    });

    const countryBias = (input.getAttribute('data-country') || DEFAULT_COUNTRY).toUpperCase();
    const opts = {
      types: ['geocode'],
      fields: ['address_component','geometry','name'],
      componentRestrictions: { country: countryBias },
    };

    const ac = new google.maps.places.Autocomplete(input, opts);

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      clearTargets(document);    // clear previous values
      fillComponents(document, place);
      // Optional: write the full formatted value back to the input
      if (place && place.name) input.value = place.name;
    });

    // Optional: bias results to current viewport
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const circle = new google.maps.Circle({
            center: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            radius: pos.coords.accuracy || 5000,
          });
          ac.setBounds(circle.getBounds());
        },
        () => {}
      );
    }
  }

  function initAll() {
    const inputs = Array.from(document.querySelectorAll(SELECTOR));
    inputs.forEach(attachAutocomplete);
  }

  function bootstrap() {
    if (window.google && google.maps && google.maps.places) {
      initAll();
    }
  }

  // Public callback used by the Google script (?callback=initPlaces)
  window.initPlaces = () => { try { initAll(); } catch (_) {} };

  // Run on DOM ready and on Astro client-side nav
  document.addEventListener('DOMContentLoaded', bootstrap);
  window.addEventListener('astro:page-load', bootstrap);
})();

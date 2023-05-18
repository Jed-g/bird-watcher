import { getNickname } from "./nickname-collector.js";

// This function generates a SPARQL query string with a keyword parameter.
const searchQuery = (keyword) =>
  encodeURIComponent(`SELECT DISTINCT ?uri ?label
WHERE {
?uri rdfs:label ?label .
?uri dbo:wikiPageWikiLink dbr:Bird .
?uri rdf:type dbo:Bird .
FILTER regex(str(?label), "${keyword}", "i")
FILTER (langMatches(lang(?label), "en"))
}
LIMIT 50`);

let suggestions = [];
let selected = 0;
let unknown = false;
let offline = !navigator.onLine;

// This function updates the autocomplete list by iterating through the suggestions array and adding HTML elements to the DOM.
const updateAutocomplete = () => {
  selected = 0;
  $("#autocomplete").empty();
  suggestions.forEach(({ label }, i) => {
    if (i === 0) {
      $("#autocomplete").append(
        $("<li>").html(`<a class="active">${label}</a>`)
      );
    } else {
      $("#autocomplete").append($("<li>").html(`<a>${label}</a>`));
    }
    $("#autocomplete")
      .children()
      .last()
      .click(() => {
        // When a suggestion is clicked, the input field loses focus, the fetchAutocomplete function is called, and the input field is updated with the selected label.
        $("#identification").blur();
        fetchAutocomplete(suggestions[i].label);
        $("#identification").val(suggestions[i].label);
      });
  });
};

// This function changes the selected suggestion in the autocomplete list.
const changeAutocompleteSelected = (newSelected) => {
  selected = newSelected;

  // Removing the active class from all suggestions and adding it to the newly selected suggestion.
  $("#autocomplete a").removeClass("active");
  $("#autocomplete")
    .children(`:nth-child(${newSelected + 1})`)
    .children()
    .addClass("active");

  $("#autocomplete")
    .children(`:nth-child(${newSelected + 1})`)
    .children()
    .get(0)
    .scrollIntoView({ block: "nearest" });
};

// This function fetches suggestions from a remote SPARQL endpoint.
const fetchAutocomplete = async (newValue) => {
  try {
    const response = await fetch(
      "https://dbpedia.org/sparql?format=json&query=" + searchQuery(newValue)
    );

    const data = (await response.json()).results.bindings;

    // Parsing the response data and storing the suggestions in the suggestions array.
    suggestions = data.map((element) => ({
      label: element.label.value,
      uri: element.uri.value,
    }));

    if ($("#identification").val().length <= 0) {
      $("#autocomplete").empty();
      suggestions = [];
    } else {
      updateAutocomplete();
    }
  } catch (error) {
    offline = true;
    $("#unknown").click();
  }
};

// This event handler is called when the value of the input field changes.
$("#identification").on("input", (e) => {
  const newValue = e.target.value;
  fetchAutocomplete(newValue);
});

$("#autocomplete").on("mousedown", (e) => e.preventDefault());
$("#identification").focus(() => $("#autocomplete").css("display", "block"));
$("#identification").blur(() => {
  suggestions[selected] !== undefined &&
    $("#identification").val(suggestions[selected].label);
  suggestions[selected] !== undefined &&
    fetchAutocomplete(suggestions[selected].label);
  $("#autocomplete").css("display", "none");
});
$("#identification").keydown((e) => {
  if (e.key === "Enter") {
    $("#identification").val(suggestions[selected].label);
    $("#identification").blur();
    fetchAutocomplete(suggestions[selected].label);
    return false;
  }

  // If the ArrowUp key is pressed and a suggestion above the current one is available, update the selected suggestion.
  if (e.key === "ArrowUp") {
    selected > 0 && changeAutocompleteSelected(selected - 1);
    return false;
  }

  // If the ArrowDown key is pressed and a suggestion below the current one is available, update the selected suggestion.
  if (e.key === "ArrowDown") {
    selected < suggestions.length - 1 &&
      changeAutocompleteSelected(selected + 1);
    return false;
  }
});

$("#unknown").click(() => {
  if (offline) {
    // If the application is offline, disable the input and update the unknown button text.
    $("#unknown").addClass("btn-disabled");
    $("#unknown").removeClass("btn-primary");
    $("#unknown").removeClass("btn-accent");
    $("#unknown").text("Offline");
    suggestions = [];
    updateAutocomplete();
    unknown = true;
    $("#identification").val("Unavailable when offline...");
    $("#identification").attr("disabled", true);
  } else if (!unknown) {
    // If the identification is not set to unknown, update the input value and unknown button text.
    unknown = true;
    $("#identification").val("UNKNOWN");
    $("#identification").attr("disabled", true);
    $("#unknown").text("Identify");
    $("#unknown").removeClass("btn-accent");
    $("#unknown").addClass("btn-primary");
    suggestions = [];
    updateAutocomplete();
  } else {
    // If the identification is set to unknown, enable the input and update the unknown button text.
    unknown = false;
    unknown = false;
    $("#identification").val("");
    $("#identification").attr("disabled", null);
    $("#unknown").text("Unknown");
    $("#unknown").addClass("btn-accent");
    $("#unknown").removeClass("btn-primary");
    suggestions = [];
    updateAutocomplete();
  }
});

navigator.onLine || $("#unknown").click();

window.addEventListener("offline", () => {
  offline = true;
  $("#unknown").click();
});

// Define locale for datepicker
const localeEn = {
  days: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthsShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  today: "Today",
  clear: "Clear",
  dateFormat: "MM/dd/yyyy",
  timeFormat: "hh:mm aa",
  firstDay: 0,
};

new AirDatepicker("#date", {
  locale: localeEn, // use the locale defined above
  isMobile: true,
  autoClose: true,
  selectedDates: [new Date()], // set the selected date to today's date
  timepicker: true,
  maxDate: new Date(),
});

// Define map object and default center coordinates
let map;
const mapCenter = { lng: -1.48048735603345, lat: 53.38174552008962 };
let locationSet = false;

window.addEventListener("offline", () => {
  if ($("#map").css("display") === "block") {
    $("#map").hide();
    $("#map-offline-info").css("display", "flex");
  }
});

// Function to use the browser's geolocation
const useGeolocation = (submit = false) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      locationSet = true;

      mapCenter.lat = position.coords.latitude;
      mapCenter.lng = position.coords.longitude;

      $("#location-error").addClass("hidden");

      if (submit) {
        $("#form").submit();
      }
    });
  }
};

useGeolocation();

$("#geolocation-button").click(() => {
  $("#geolocation-info").css("display", "flex");
  $("#map-offline-info").hide();
  $("#map").hide();
  $("#map-button").removeClass("btn-active");
  $("#geolocation-button").addClass("btn-active");

  useGeolocation();
});

$("#map-button").click(() => {
  $("#geolocation-info").css("display", "none");
  $("#map-button").addClass("btn-active");
  $("#geolocation-button").removeClass("btn-active");

  if (!navigator.onLine) {
    $("#map-offline-info").css("display", "flex");
    return;
  } else {
    locationSet = true;
    $("#form button").css("backgroundColor", "");

    $("#map").show();

    if (!map) {
      // Create a new map using Mapbox GL JS
      map = new maplibregl.Map({
        container: "map",
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
            },
          ],
          center: [mapCenter.lng, mapCenter.lat], // starting position [lng, lat]
          zoom: 10, // starting zoom
        },
      });

      // Add the default map navigation control.
      map.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true,
        })
      );

      // Add a geolocate control to the map.
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
        })
      );

      const marker = new maplibregl.Marker()
        .setLngLat(map.getCenter())
        .addTo(map);

      // Update the mapCenter variable and marker position whenever the map is moved.
      map.on("move", () => {
        mapCenter.lng = map.getCenter().lng;
        mapCenter.lat = map.getCenter().lat;
        marker.setLngLat(map.getCenter());
      });
    }
  }
});

let photoBase64;

$("#photo-upload").on("change", (e) => {
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    $("#preview").html(`<div class="preview">
      <img src="${reader.result}" alt="Preview Image" class="preview-img">
    </div>`);

    photoBase64 = reader.result;
  });
  reader.readAsDataURL(e.target.files[0]);
});

$("#form").submit(async (e) => {
  e.preventDefault();

  $("#location-error").addClass("hidden");
  $("#identification-error").addClass("hidden");

  let valid = true;

  // If the user hasn't selected "unknown" and the selected species isn't in the suggestion list, show an error message.
  if (!unknown && suggestions[selected] === undefined) {
    $("#identification-error").removeClass("hidden");
    valid = false;
  }

  // If the location hasn't been set, show an error message and attempt to use geolocation if the user allows it.
  if (!locationSet) {
    $("#location-error").removeClass("hidden");

    if (valid) {
      useGeolocation(true);
    } else {
      useGeolocation(false);
    }

    valid = false;
  }

  if (!valid) {
    return;
  }

  const date = $("#date").val();
  const description = $("#description").val();
  const timeZoneOffset = new Date().getTimezoneOffset();

  let nickname;

  try {
    nickname = await getNickname(); // Calls getNickname() function and assigns the returned value to nickname variable.
  } catch (error) {
    console.error("Nickname not defined");
  }

  const payload = {
    date,
    description,
    timeZoneOffset,
    userNickname: nickname,
    location: mapCenter.lat + " " + mapCenter.lng,
    chat: [],
  };

  // If the selected suggestion has a URI, add it to the payload object.
  if (suggestions[selected] !== undefined) {
    payload.identificationURI = suggestions[selected].uri;
  }

  if (photoBase64 !== undefined) {
    payload.photo = photoBase64;
  }

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };

  const response = await fetch("/api/add", requestOptions);

  if (!response.ok) {
    $(":submit").css("backgroundColor", "red");
  } else {
    window.location.assign(response.url);
  }
});

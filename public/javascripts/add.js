import { getNickname } from "./nickname-collector.js";

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
        $("#identification").blur();
        fetchAutocomplete(suggestions[i].label);
        $("#identification").val(suggestions[i].label);
      });
  });
};

const changeAutocompleteSelected = (newSelected) => {
  selected = newSelected;

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

const fetchAutocomplete = async (newValue) => {
  try {
    const response = await fetch(
      "https://dbpedia.org/sparql?format=json&query=" + searchQuery(newValue)
    );

    const data = (await response.json()).results.bindings;

    suggestions = data.map((element) => ({
      label: element.label.value,
      uri: element.uri.value,
    }));

    if ($("#identification").val().length <= 0) {
      $("#autocomplete").empty();
    } else {
      updateAutocomplete();
    }
  } catch (error) {
    offline = true;
    $("#unknown").click();
  }
};

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

  if (e.key === "ArrowUp") {
    selected > 0 && changeAutocompleteSelected(selected - 1);
    return false;
  }

  if (e.key === "ArrowDown") {
    selected < suggestions.length - 1 &&
      changeAutocompleteSelected(selected + 1);
    return false;
  }
});

$("#unknown").click(() => {
  if (offline) {
    $("#identification").val("Unavailable when offline...");
    $("#identification").attr("disabled", true);
    $("#unknown").addClass("btn-disabled");
    $("#unknown").removeClass("btn-primary");
    $("#unknown").removeClass("btn-accent");
    $("#unknown").text("Offline");
    suggestions = [];
    updateAutocomplete();
    unknown = true;
  } else if (!unknown) {
    unknown = true;
    $("#identification").val("UNKNOWN");
    $("#identification").attr("disabled", true);
    $("#unknown").text("Identify");
    $("#unknown").removeClass("btn-accent");
    $("#unknown").addClass("btn-primary");
    suggestions = [];
    updateAutocomplete();
  } else {
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
  locale: localeEn,
  isMobile: true,
  autoClose: true,
  selectedDates: [new Date()],
  timepicker: true,
});

let map;
const mapCenter = { lng: -1.48048735603345, lat: 53.38174552008962 };
let locationSet = false;

window.addEventListener("offline", () => {
  if ($("#map").css("display") === "block") {
    $("#map").hide();
    $("#map-offline-info").css("display", "flex");
  }
});

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

      map.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true,
        })
      );

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

      map.on("move", () => {
        mapCenter.lng = map.getCenter().lng;
        mapCenter.lat = map.getCenter().lat;
        marker.setLngLat(map.getCenter());
      });
    }
  }
});

$("#form").submit(async (e) => {
  e.preventDefault();

  $("#location-error").addClass("hidden");
  $("#identification-error").addClass("hidden");

  let valid = true;

  if (!unknown && suggestions[selected] === undefined) {
    $("#identification-error").removeClass("hidden");
    valid = false;
  }

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
    nickname = await getNickname();
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

  if (suggestions[selected] !== undefined) {
    payload.identificationURI = suggestions[selected].uri;
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

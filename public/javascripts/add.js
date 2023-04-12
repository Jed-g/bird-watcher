import { getNickname } from "./nickname-collector.js";

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

const useGeolocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      locationSet = true;
      $("#form button").css("backgroundColor", "");

      mapCenter.lat = position.coords.latitude;
      mapCenter.lng = position.coords.longitude;
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

  if (!locationSet) {
    $("#form button").css("backgroundColor", "red");
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

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date,
      description,
      timeZoneOffset,
      userNickname: nickname,
      location: mapCenter.lat + " " + mapCenter.lng,
      chat: [],
    }),
  };

  const response = await fetch("/api/add", requestOptions);

  if (!response.ok) {
    $("#form button").css("backgroundColor", "red");
  } else {
    window.location.assign(response.url);
  }
});

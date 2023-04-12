let map;
const mapCenter = { lng: -1.48048735603345, lat: 53.38174552008962 };
let locationSet = false;

const distance = (lat1, lon1, lat2, lon2, unit) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    let radlat1 = (Math.PI * lat1) / 180;
    let radlat2 = (Math.PI * lat2) / 180;
    let theta = lon1 - lon2;
    let radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
};

const insertDataIntoDOM = (data) => {
  $("#table-container").removeClass("hidden");
  $("#table-container").css("display", "flex");
  $("#location-selector").hide();

  data.forEach(({ location, userNickname, _id }) => {
    const lat = parseFloat(location.split(" ")[0]);
    const lng = parseFloat(location.split(" ")[1]);
    const DECIMAL_PLACES_TO_ROUND_TO = 3;
    const distanceFromUserInKms =
      Math.round(
        distance(lat, lng, mapCenter.lat, mapCenter.lng, "K") *
          Math.pow(10, DECIMAL_PLACES_TO_ROUND_TO)
      ) / Math.pow(10, DECIMAL_PLACES_TO_ROUND_TO);

    const cloned = $("#initial-row").clone(true);
    cloned.removeAttr("id");
    cloned.removeClass("hidden");
    cloned.children(":nth-child(1)").text("UNKNOWN");
    cloned.children(":nth-child(2)").text(distanceFromUserInKms);
    cloned.children(":nth-child(3)").text(userNickname);
    cloned
      .children(":nth-child(4)")
      .children(":first")
      .attr("href", "/post?id=" + _id);
    cloned.appendTo("tbody");
  });
  $("#initial-row").remove();
};

$("#location-button").click(async () => {
  if (!locationSet) {
    $("#location-button").css("backgroundColor", "red");
    return;
  }

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location: mapCenter }),
  };
  const response = await fetch("/api/nearby", requestOptions);
  const data = await response.json();
  insertDataIntoDOM(data);
});

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
      $("#location-button").css("backgroundColor", "");

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
    $("#location-button").css("backgroundColor", "");

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

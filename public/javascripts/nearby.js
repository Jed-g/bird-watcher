import { getNickname } from "./nickname-collector.js";

let map;
const mapCenter = { lng: -1.48048735603345, lat: 53.38174552008962 };
let locationSet = false;

// Function to calculate distance between two points
const distance = (lat1, lon1, lat2, lon2, unit) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    // Convert latitudes and longitudes to radians
    let radlat1 = (Math.PI * lat1) / 180;
    let radlat2 = (Math.PI * lat2) / 180;
    let theta = lon1 - lon2;
    let radtheta = (Math.PI * theta) / 180;
    // Calculate distance using the Haversine formula
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    // Convert distance to kilometers or nautical miles based on the unit
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
};

// Function to insert data into the HTML DOM
const insertDataIntoDOM = (data, currentNickname) => {
  $("#table-container").removeClass("hidden");
  $("#table-container").css("display", "flex");
  $("#location-selector").hide();

  // Iterate over the data and append rows to the table
  data.forEach(({ location, userNickname, _id, identified, label }) => {
    const lat = parseFloat(location.split(" ")[0]);
    const lng = parseFloat(location.split(" ")[1]);
    const DECIMAL_PLACES_TO_ROUND_TO = 3;
    // Calculate the distance from the user's location
    const distanceFromUserInKms =
      Math.round(
        distance(lat, lng, mapCenter.lat, mapCenter.lng, "K") *
          Math.pow(10, DECIMAL_PLACES_TO_ROUND_TO)
      ) / Math.pow(10, DECIMAL_PLACES_TO_ROUND_TO);

    const cloned = $("#initial-row").clone(true);
    cloned.removeAttr("id");
    cloned.removeClass("hidden");

    if (userNickname === currentNickname) {
      cloned
        .children(":nth-child(1)")
        .html("<p class='checkmark text-xl'>✓</p>");
    }

    // Set the label, distance, and user nickname
    const labelText = identified ? label : "UNKNOWN";
    cloned
      .children(":nth-child(2)")
      .text(labelText.length > 20 ? labelText.slice(0, 17) + "..." : labelText);
    cloned.children(":nth-child(3)").text(distanceFromUserInKms);
    cloned.children(":nth-child(4)").text(userNickname);
    cloned
      .children(":nth-child(5)")
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

  // Set request options
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location: mapCenter }),
  };
  // Send a request to the server to retrieve nearby locations
  const response = await fetch("/api/nearby", requestOptions);
  const data = await response.json();

  const currentNickname = await getNickname();

  // Insert the retrieved data into the DOM
  insertDataIntoDOM(data, currentNickname);
});

window.addEventListener("offline", () => {
  // Hide the map and show the offline info message if the map is currently displayed
  if ($("#map").css("display") === "block") {
    $("#map").hide();
    $("#map-offline-info").css("display", "flex");
  }
});

// function to get the user's geolocation
const useGeolocation = () => {
  if (navigator.geolocation) {
    // Get the user's current position
    navigator.geolocation.getCurrentPosition((position) => {
      locationSet = true;
      $("#location-button").css("backgroundColor", "");
      // Set the center of the map to the user's current position
      mapCenter.lat = position.coords.latitude;
      mapCenter.lng = position.coords.longitude;
    });
  }
};

// Get the user's geolocation when the page is loaded
useGeolocation();

// Event listener for the geolocation button
$("#geolocation-button").click(() => {
  $("#geolocation-info").css("display", "flex");
  $("#map-offline-info").hide();
  $("#map").hide();
  $("#map-button").removeClass("btn-active");
  $("#geolocation-button").addClass("btn-active");

  useGeolocation();
});

// Event listener for the map button
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
      // If not initialized , initialize the map with the user's current position as the center
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

      // Add the navigation control to the map
      map.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true,
        })
      );

      // Add the geolocation control to the map
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
        })
      );

      // Create a new marker and add it to the map at the center
      const marker = new maplibregl.Marker()
        .setLngLat(map.getCenter())
        .addTo(map);

      // Listen for the map's "move" event and update the center and marker position
      map.on("move", () => {
        mapCenter.lng = map.getCenter().lng;
        mapCenter.lat = map.getCenter().lat;
        marker.setLngLat(map.getCenter());
      });
    }
  }
});

import { getNickname } from "./nickname-collector.js";
import {
  getByIdFromObjectStore,
  updateByIdInObjectStore,
} from "./indexeddb.js";

let nickname = "";
const socket = io();

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (params, key) => params.get(key),
});

let existsInPosts;

// Load posts from IndexedDB
(async () => {
  existsInPosts = await getByIdFromObjectStore(params.id, "posts");
})();

// Join socket room
socket.emit("joinRoom", { postId: params.id });

// Listen for incoming chat messages
socket.on("message", (data) => loadNewChatMessage(data));

// Load chat messages into the DOM
const loadChatMessages = (chat) => {
  chat?.forEach(({ userNickname, message, date: dateString }) => {
    const date = new Date(dateString);
    // Determine whether the message belongs to the current user
    const isOwnMessage = nickname === userNickname;

    let cloned;

    if (isOwnMessage) {
      // Clone the user's own message
      cloned = $(".chat-end.hidden").clone(true);
    } else {
      // Clone other users' messages
      cloned = $(".chat-start.hidden").clone(true);
    }

    // Update the message author, text, and time
    cloned.removeClass("hidden");
    cloned.children(".message-author").text(userNickname);
    cloned.children(".message").text(message);
    cloned
      .children(".message-time")
      .text(
        date.toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })
      );

    cloned.appendTo("#chat");
  });

  $("#chat").scrollTop(function () {
    return this.scrollHeight;
  });
};

// Load a new chat message into the DOM
const loadNewChatMessage = async ({ message, nickname: messageAuthor }) => {
  // Get the current date and time
  const date = new Date();

  // Get the post from IndexedDB
  const post = existsInPosts
    ? await getByIdFromObjectStore(params.id, "posts")
    : await getByIdFromObjectStore(
        parseInt(params.id),
        "syncWhenOnlineNewPosts"
      );

  // Add the new chat message to the post object
  post?.chat?.push({
    userNickname: messageAuthor,
    message,
    date: date.toISOString(),
  });

  // Update the post object in IndexedDB
  existsInPosts
    ? await updateByIdInObjectStore(params.id, post, "posts")
    : await updateByIdInObjectStore(
        parseInt(params.id),
        post,
        "syncWhenOnlineNewPosts"
      );

  // Determine whether the message belongs to the current user
  const isOwnMessage = nickname === messageAuthor;

  let cloned;

  if (isOwnMessage) {
    // Clone the user's own message
    cloned = $(".chat-end.hidden").clone(true);
  } else {
    // Clone other users' messages
    cloned = $(".chat-start.hidden").clone(true);
  }

  cloned.removeClass("hidden");
  cloned.children(".message-author").text(messageAuthor);
  cloned.children(".message").text(message);
  cloned
    .children(".message-time")
    .text(
      date.toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })
    );

  cloned.appendTo("#chat");

  $("#chat").scrollTop(function () {
    return this.scrollHeight;
  });
};

// Initializes the maps for desktop and mobile views
const initializeMaps = (location) => {
  if (!navigator.onLine) {
    $(".map-offline-info").css("display", "flex");
    $("#map-desktop").hide();
    $("#map-mobile").hide();
  }

  // If network connection is lost, hide maps and display offline message
  window.addEventListener("offline", () => {
    $(".map-offline-info").css("display", "flex");
    $("#map-desktop").hide();
    $("#map-mobile").hide();
  });

  // Parse latitude and longitude from location data
  const lat = parseFloat(location.split(" ")[0]);
  const lng = parseFloat(location.split(" ")[1]);

  // Initialize desktop map
  const mapDesktop = new maplibregl.Map({
    container: "map-desktop",
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
      center: [lng, lat], // starting position [lng, lat]
      zoom: 10, // starting zoom
    },
  });

  // Add navigation controls to desktop map
  mapDesktop.addControl(
    new maplibregl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true,
    })
  );

  // Add geolocation controls to desktop map
  mapDesktop.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
    })
  );

  // Add a marker to the desktop map at the specified location
  new maplibregl.Marker().setLngLat([lng, lat]).addTo(mapDesktop);

  // Initialize mobile map
  const mapMobile = new maplibregl.Map({
    container: "map-mobile",
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
      center: [lng, lat], // starting position [lng, lat]
      zoom: 10, // starting zoom
    },
  });

  // Add navigation controls to desktop map
  mapMobile.addControl(
    new maplibregl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true,
    })
  );

  // Add geolocation controls to desktop map
  mapMobile.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
    })
  );

  // Add a marker to the desktop map at the specified location
  new maplibregl.Marker().setLngLat([lng, lat]).addTo(mapMobile);
};

// Inserts data into the HTML document
const insertDataIntoDOM = ({
  description,
  userNickname,
  date: dateString,
  location,
  chat,
  identified,
  label,
  uri,
  abstract,
  _id,
}) => {
  const isOwnPost = nickname === userNickname;
  if (isOwnPost) {
    $("#edit-identification").removeClass("hidden");
    $("#edit-identification").attr("href", "/edit?id=" + _id);
  }
  // If the post is unidentified, hide certain elements and display "UNKNOWN" as identification
  if (!identified) {
    $("#identification").text("UNKNOWN");
    $(".uri-link").remove();
    $("#abstract-mobile").parent().remove();
    $("#abstract-desktop").parent().remove();
    $(".abstract-divider").remove();
  } // Otherwise, display the identification label, URI link, and abstract
  else {
    $("#identification").text(label);
    $("#abstract-mobile").text(abstract);
    $("#abstract-desktop").text(abstract);
    $(".uri-link").attr("href", uri);
  }

  // Convert the date string to a date object and display in the appropriate formats
  const date = new Date(dateString);
  $("#date-desktop").text(
    date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
  );
  $("#date-mobile").text(
    date.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })
  );
  // Display the user's nickname, post description, and rounded location coordinates
  $("#user").text(userNickname);
  $(".description").text(description?.length > 0 ? description : "NONE");

  const DECIMAL_PLACES_TO_ROUND_TO = 8;

  const lat =
    Math.round(
      parseFloat(location.split(" ")[0]) *
        Math.pow(10, DECIMAL_PLACES_TO_ROUND_TO)
    ) / Math.pow(10, DECIMAL_PLACES_TO_ROUND_TO);
  const lng =
    Math.round(
      parseFloat(location.split(" ")[1]) *
        Math.pow(10, DECIMAL_PLACES_TO_ROUND_TO)
    ) / Math.pow(10, DECIMAL_PLACES_TO_ROUND_TO);

  $(".location").text(`${lat}, ${lng}`);

  // Load the chat messages and initialize the map
  loadChatMessages(chat);
  initializeMaps(location);
};

// Function to handle message submission
const handleMessageSubmit = async () => {
  const message = $("#send-message").val();
  $("#send-message").val("");

  // If there is a message and a nickname, emit a "message" event and send an HTTP request to add the message
  if (message.length > 0 && nickname.length > 0) {
    socket.emit("message", { postId: params.id, message, nickname });

    const timeZoneOffset = new Date().getTimezoneOffset();

    // There has to be a seperate HTTP request since service workers cannot normally intercept web sockets
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId: params.id,
        message,
        nickname,
        date: new Date(),
        timeZoneOffset,
      }),
    };

    existsInPosts && fetch("/api/message", requestOptions);
    // Load the new chat message
    loadNewChatMessage({ message, nickname });
  }
};

// Initialize the post page
(async () => {
  try {
    // Tries to get the nickname of the user
    nickname = await getNickname();
  } catch (error) {}

  // Makes a fetch request to get the post data
  const response = await fetch("/api/post" + window.location.search);
  const data = await response.json();

  // Inserts the post data into the HTML document
  insertDataIntoDOM(data);

  $("#send-button").click(handleMessageSubmit);
  $("#send-message").keydown((e) => {
    if (e.key === "Enter") {
      handleMessageSubmit();
      return false;
    }
  });
})();

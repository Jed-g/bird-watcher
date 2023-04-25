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

(async () => {
  existsInPosts = await getByIdFromObjectStore(params.id, "posts");
})();

socket.emit("joinRoom", { postId: params.id });
socket.on("message", (data) => loadNewChatMessage(data));

const loadChatMessages = (chat) => {
  chat?.forEach(({ userNickname, message, date: dateString }) => {
    const date = new Date(dateString);
    const isOwnMessage = nickname === userNickname;

    let cloned;

    if (isOwnMessage) {
      cloned = $(".chat-end.hidden").clone(true);
    } else {
      cloned = $(".chat-start.hidden").clone(true);
    }

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

const loadNewChatMessage = async ({ message, nickname: messageAuthor }) => {
  const date = new Date();

  const post = existsInPosts
    ? await getByIdFromObjectStore(params.id, "posts")
    : await getByIdFromObjectStore(
        parseInt(params.id),
        "syncWhenOnlineNewPosts"
      );

  post?.chat?.push({
    userNickname: messageAuthor,
    message,
    date: date.toISOString(),
  });

  existsInPosts
    ? await updateByIdInObjectStore(params.id, post, "posts")
    : await updateByIdInObjectStore(
        parseInt(params.id),
        post,
        "syncWhenOnlineNewPosts"
      );

  const isOwnMessage = nickname === messageAuthor;

  let cloned;

  if (isOwnMessage) {
    cloned = $(".chat-end.hidden").clone(true);
  } else {
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

const initializeMaps = (location) => {
  if (!navigator.onLine) {
    $(".map-offline-info").css("display", "flex");
    $("#map-desktop").hide();
    $("#map-mobile").hide();
  }

  window.addEventListener("offline", () => {
    $(".map-offline-info").css("display", "flex");
    $("#map-desktop").hide();
    $("#map-mobile").hide();
  });

  const lat = parseFloat(location.split(" ")[0]);
  const lng = parseFloat(location.split(" ")[1]);

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

  mapDesktop.addControl(
    new maplibregl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true,
    })
  );

  mapDesktop.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
    })
  );

  new maplibregl.Marker().setLngLat([lng, lat]).addTo(mapDesktop);

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

  mapMobile.addControl(
    new maplibregl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true,
    })
  );

  mapMobile.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
    })
  );

  new maplibregl.Marker().setLngLat([lng, lat]).addTo(mapMobile);
};

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
}) => {
  if (!identified) {
    $("#identification").text("UNKNOWN");
    $(".uri-link").remove();
    $("#abstract-mobile").parent().remove();
    $("#abstract-desktop").parent().remove();
    $(".abstract-divider").remove();
  } else {
    $("#identification").text(label);
    $("#abstract-mobile").text(abstract);
    $("#abstract-desktop").text(abstract);
    $(".uri-link").attr("href", uri);
  }

  const date = new Date(dateString);
  $("#date-desktop").text(
    date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
  );
  $("#date-mobile").text(
    date.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })
  );
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

  loadChatMessages(chat);
  initializeMaps(location);
};

const handleMessageSubmit = async () => {
  const message = $("#send-message").val();
  $("#send-message").val("");

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
    loadNewChatMessage({ message, nickname });
  }
};

(async () => {
  try {
    nickname = await getNickname();
  } catch (error) {}

  const response = await fetch("/api/post" + window.location.search);
  const data = await response.json();

  insertDataIntoDOM(data);

  $("#send-button").click(handleMessageSubmit);
  $("#send-message").keydown((e) => {
    if (e.key === "Enter") {
      handleMessageSubmit();
      return false;
    }
  });
})();

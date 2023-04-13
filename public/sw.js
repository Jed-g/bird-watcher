const CACHE_NAME = "cache-1";

oninstall = (e) => {
  console.log("Service worker installing");
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll([
        "/",
        "/add",
        "/nearby",
        "/post",
        "/stylesheets/style.css",
        "/stylesheets/custom.css",
        "/javascripts/add.js",
        "/javascripts/index.js",
        "/javascripts/nickname-collector.js",
        "/javascripts/indexeddb.js",
        "/javascripts/post.js",
        "/javascripts/nearby.js",
        "/lib/air-datepicker.min.css",
        "/lib/air-datepicker.min.js",
        "/lib/maplibre-gl.css",
        "/lib/maplibre-gl.js",
        "/lib/jquery-3.6.4.min.js",
        "/manifest.json",
        "/images/favicon.ico",
        "/images/icons/icon-48x48.png",
        "/images/icons/icon-72x72.png",
        "/images/icons/icon-96x96.png",
        "/images/icons/icon-128x128.png",
        "/images/icons/icon-144x144.png",
        "/images/icons/icon-152x152.png",
        "/images/icons/icon-192x192.png",
        "/images/icons/icon-384x384.png",
        "/images/icons/icon-512x512.png",
        "/socket.io/socket.io.js",
      ]);
    })
  );
};

onactivate = (e) => {
  console.log("Service worker activating");
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
};

const addToObjectStore = (data, storeName) => {
  return new Promise((resolve) => {
    const dbOpenRequest = indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      if (!db.objectStoreNames.contains("nickname")) {
        db.createObjectStore("nickname", { keyPath: "nickname" });
      }

      if (!db.objectStoreNames.contains("syncWhenOnlineNewPosts")) {
        db.createObjectStore("syncWhenOnlineNewPosts", {
          keyPath: "_id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("syncWhenOnlineNewMessages")) {
        db.createObjectStore("syncWhenOnlineNewMessages", {
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("posts")) {
        db.createObjectStore("posts", { keyPath: "_id" });
      }
    };

    dbOpenRequest.onsuccess = () => {
      const db = dbOpenRequest.result;
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      store.put(data);
      transaction.oncomplete = () => {
        resolve();
        db.close();
      };
    };
  });
};

const getByIdFromObjectStore = (id, storeName) => {
  return new Promise((resolve) => {
    const dbOpenRequest = indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      if (!db.objectStoreNames.contains("nickname")) {
        db.createObjectStore("nickname", { keyPath: "nickname" });
      }

      if (!db.objectStoreNames.contains("syncWhenOnlineNewPosts")) {
        db.createObjectStore("syncWhenOnlineNewPosts", {
          keyPath: "_id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("syncWhenOnlineNewMessages")) {
        db.createObjectStore("syncWhenOnlineNewMessages", {
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("posts")) {
        db.createObjectStore("posts", { keyPath: "_id" });
      }
    };

    dbOpenRequest.onsuccess = () => {
      const db = dbOpenRequest.result;
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
        db.close();
      };
    };
  });
};

const updateByIdInObjectStore = (id, data, storeName) => {
  return new Promise((resolve) => {
    const dbOpenRequest = indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      if (!db.objectStoreNames.contains("nickname")) {
        db.createObjectStore("nickname", { keyPath: "nickname" });
      }

      if (!db.objectStoreNames.contains("syncWhenOnlineNewPosts")) {
        db.createObjectStore("syncWhenOnlineNewPosts", {
          keyPath: "_id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("syncWhenOnlineNewMessages")) {
        db.createObjectStore("syncWhenOnlineNewMessages", {
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("posts")) {
        db.createObjectStore("posts", { keyPath: "_id" });
      }
    };

    dbOpenRequest.onsuccess = () => {
      const db = dbOpenRequest.result;
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        addToObjectStore(data, storeName).then(() => {
          resolve();
          db.close();
        });
      };
    };
  });
};

const getAllFromObjectStore = (storeName) => {
  return new Promise((resolve) => {
    const dbOpenRequest = indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      if (!db.objectStoreNames.contains("nickname")) {
        db.createObjectStore("nickname", { keyPath: "nickname" });
      }

      if (!db.objectStoreNames.contains("syncWhenOnlineNewPosts")) {
        db.createObjectStore("syncWhenOnlineNewPosts", {
          keyPath: "_id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("syncWhenOnlineNewMessages")) {
        db.createObjectStore("syncWhenOnlineNewMessages", {
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("posts")) {
        db.createObjectStore("posts", { keyPath: "_id" });
      }
    };

    dbOpenRequest.onsuccess = () => {
      const db = dbOpenRequest.result;
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
        db.close();
      };
    };
  });
};

const clearObjectStore = (storeName) => {
  return new Promise((resolve) => {
    const dbOpenRequest = indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      if (!db.objectStoreNames.contains("nickname")) {
        db.createObjectStore("nickname", { keyPath: "nickname" });
      }

      if (!db.objectStoreNames.contains("syncWhenOnlineNewPosts")) {
        db.createObjectStore("syncWhenOnlineNewPosts", {
          keyPath: "_id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("syncWhenOnlineNewMessages")) {
        db.createObjectStore("syncWhenOnlineNewMessages", {
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("posts")) {
        db.createObjectStore("posts", { keyPath: "_id" });
      }
    };

    dbOpenRequest.onsuccess = () => {
      const db = dbOpenRequest.result;
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
        db.close();
      };
    };
  });
};

const sync = async () => {
  console.log("syncing");

  const newPostFetchRequests = [];

  const syncWhenOnlineNewPosts = await getAllFromObjectStore(
    "syncWhenOnlineNewPosts"
  );

  syncWhenOnlineNewPosts.forEach((obj) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj),
    };

    newPostFetchRequests.push(fetch("/api/add", requestOptions));
  });

  await clearObjectStore("syncWhenOnlineNewPosts");

  await Promise.all(newPostFetchRequests);

  const newMessageFetchRequests = [];

  const syncWhenOnlineNewMessages = await getAllFromObjectStore(
    "syncWhenOnlineNewMessages"
  );

  syncWhenOnlineNewMessages.forEach((obj) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj),
    };

    newMessageFetchRequests.push(fetch("/api/message", requestOptions));
  });

  await clearObjectStore("syncWhenOnlineNewMessages");

  await Promise.all(newMessageFetchRequests);

  const response = await fetch("/api/recent");
  const data = await response.json();
  await clearObjectStore("posts");
  data.forEach((element) => addToObjectStore(element, "posts"));

  const clients_ = await clients.matchAll({ type: "window" });
  clients_.forEach((client) => {
    client.postMessage("reload");
  });
};

onmessage = (e) => {
  if (e.data === "online") {
    sync();
  }
};

const handleRecent = async (request) => {
  let response;
  try {
    response = await fetch(request);

    const responseClone = response.clone();
    const data = await responseClone.json();

    data.forEach((element) => addToObjectStore(element, "posts"));
  } catch (error) {
    const data = [
      ...(await getAllFromObjectStore("posts")),
      ...(await getAllFromObjectStore("syncWhenOnlineNewPosts")),
    ];
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    response = new Response(JSON.stringify(data), { status: 200 });
  }
  return response;
};

// GeoDataSource.com (C) All Rights Reserved 2022
// Licensed under LGPLv3.
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

const handleNearby = async (request) => {
  const requestClone = request.clone();
  let response;
  try {
    response = await fetch(request);
    await clearObjectStore("posts");
    const responseClone = response.clone();
    const data = await responseClone.json();

    data.forEach((element) => addToObjectStore(element, "posts"));
  } catch (error) {
    const data = [
      ...(await getAllFromObjectStore("posts")),
      ...(await getAllFromObjectStore("syncWhenOnlineNewPosts")),
    ];
    const {
      location: { lat, lng },
    } = await requestClone.json();
    data.sort((a, b) => {
      const lat1 = parseFloat(a.location.split(" ")[0]);
      const long1 = parseFloat(a.location.split(" ")[1]);
      const lat2 = parseFloat(b.location.split(" ")[0]);
      const long2 = parseFloat(b.location.split(" ")[1]);

      const distance1 = distance(lat1, long1, lat, lng);
      const distance2 = distance(lat2, long2, lat, lng);

      return distance1 - distance2;
    });
    response = new Response(JSON.stringify(data), { status: 200 });
  }
  return response;
};

const handleAdd = async (request) => {
  let requestClone = request.clone();
  let response;
  const data = await requestClone.json();
  try {
    response = await fetch(request);
  } catch (error) {
    await addToObjectStore(data, "syncWhenOnlineNewPosts");
    response = Response.redirect("/");
  }
  return response;
};

const handleViewPost = async (request) => {
  const params = new Proxy(new URLSearchParams(request.url.split("?")[1]), {
    get: (params, key) => params.get(key),
  });

  let response;
  try {
    response = await fetch(request);
    const responseClone = response.clone();
    const data = await responseClone.json();

    if (await getByIdFromObjectStore(params.id, "posts")) {
      await updateByIdInObjectStore(params.id, data, "posts");
    }
  } catch (error) {
    let data;
    if (await getByIdFromObjectStore(params.id, "posts")) {
      data = await getByIdFromObjectStore(params.id, "posts");
    } else {
      data = await getByIdFromObjectStore(
        parseInt(params.id),
        "syncWhenOnlineNewPosts"
      );
    }

    response = new Response(JSON.stringify(data), { status: 200 });
  }
  return response;
};

const handleSendMessage = async (request) => {
  let requestClone = request.clone();
  let response;
  try {
    response = await fetch(request);
  } catch (error) {
    const data = await requestClone.json();
    await addToObjectStore(data, "syncWhenOnlineNewMessages");
    response = new Response(JSON.stringify({ status: "OK" }), { status: 200 });
  }
  return response;
};

onfetch = (e) => {
  const url = new URL(e.request.url);
  const target = url.pathname;
  // const method = e.request.method;
  e.respondWith(
    (async () => {
      switch (target) {
        case "/post":
          return caches.match("/post").then((response) => {
            if (response) {
              return response;
            } else {
              return fetch(e.request);
            }
          });
        case "/api/recent":
          return handleRecent(e.request);
        case "/api/add":
          return handleAdd(e.request);
        case "/api/post":
          return handleViewPost(e.request);
        case "/api/message":
          return handleSendMessage(e.request);
        case "/api/nearby":
          return handleNearby(e.request);
        default:
          return caches.match(e.request).then((response) => {
            if (response) {
              return response;
            } else {
              return fetch(e.request);
            }
          });
      }
    })()
  );
};

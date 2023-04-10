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
        "/javascripts/post.js",
        "/lib/air-datepicker.min.css",
        "/lib/air-datepicker.min.js",
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

      if (!db.objectStoreNames.contains("syncWhenOnline")) {
        db.createObjectStore("syncWhenOnline", { autoIncrement: true });
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

const getAllFromObjectStore = (storeName) => {
  return new Promise((resolve) => {
    const dbOpenRequest = indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      if (!db.objectStoreNames.contains("nickname")) {
        db.createObjectStore("nickname", { keyPath: "nickname" });
      }

      if (!db.objectStoreNames.contains("syncWhenOnline")) {
        db.createObjectStore("syncWhenOnline", { autoIncrement: true });
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

      if (!db.objectStoreNames.contains("syncWhenOnline")) {
        db.createObjectStore("syncWhenOnline", { autoIncrement: true });
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

  const syncWhenOnline = await getAllFromObjectStore("syncWhenOnline");

  syncWhenOnline.forEach((obj) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj),
    };

    fetch("/api/add", requestOptions);
  });

  await clearObjectStore("syncWhenOnline");
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
  if (navigator.onLine) {
    return fetch(request);
  } else {
    console.log("currently offline");
  }
};

const handleAdd = async (request) => {
  let requestClone = request.clone();
  let response;
  try {
    response = await fetch(request);
  } catch (error) {
    const data = await requestClone.json();
    await addToObjectStore(data, "syncWhenOnline");
    response = Response.redirect("/");
  }
  return response;
};

const handleViewPost = async (request) => {
  if (navigator.onLine) {
    return fetch(request);
  } else {
    console.log("currently offline");
  }
};

const handleSendMessage = async (request) => {
  if (navigator.onLine) {
    return fetch(request);
  } else {
    console.log("currently offline");
  }
};

onfetch = (e) => {
  const url = new URL(e.request.url);
  const target = url.pathname;
  // const method = e.request.method;
  e.respondWith(
    (async () => {
      switch (target) {
        case "/api/recent":
          return handleRecent(e.request);
        case "/api/add":
          return handleAdd(e.request);
        case "/api/post":
          return handleViewPost(e.request);
        case "/api/message":
          return handleSendMessage(e.request);
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

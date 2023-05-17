import { getByIdFromObjectStore, getAllFromObjectStore } from "./indexeddb.js";

if ("serviceWorker" in navigator) {
  // Register the service worker with the file '/sw.js'
  navigator.serviceWorker.register("/sw.js");

  // Add an event listener to the window that listens for when the browser is back online
  window.addEventListener("online", () => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active.postMessage("online");
    });
  });

  (async () => {
    const [newPosts, newMessages, postEdits] = [
      await getAllFromObjectStore("syncWhenOnlineNewPosts"),
      await getAllFromObjectStore("syncWhenOnlineNewMessages"),
      await getAllFromObjectStore("syncWhenOnlinePostEdits"),
    ];
    if (newPosts.length > 0 || newMessages.length > 0 || postEdits.length > 0) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active.postMessage("online");
      });
    }
  })();

  // Add an event listener to the service worker that listens for incoming messages
  navigator.serviceWorker.addEventListener("message", async (e) => {
    if (e.data === "reload") {
      if (window.location.pathname === "/post") {
        const params = new Proxy(new URLSearchParams(window.location.search), {
          get: (params, key) => params.get(key),
        });

        const existsInPosts = await getByIdFromObjectStore(params.id, "posts");
        existsInPosts ? window.location.reload() : window.location.replace("/");
      } else {
        window.location.reload();
      }
    }
  });
}

//Function that returns the nickname
const getNickname = () => {
  return new Promise((resolve, reject) => {
    const dbOpenRequest = window.indexedDB.open("birdWatcher");

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

      if (!db.objectStoreNames.contains("syncWhenOnlinePostEdits")) {
        db.createObjectStore("syncWhenOnlinePostEdits", { keyPath: "_id" });
      }
    };

    // when the database is successfully opened, try to get the nickname from the 'nickname' object store
    dbOpenRequest.onsuccess = () => {
      const db = dbOpenRequest.result;
      const transaction = db.transaction("nickname", "readwrite");
      const store = transaction.objectStore("nickname");
      const request = store.getAll();

      // if there is no nickname in the 'nickname' object store, reject the promise
      // otherwise, resolve the promise with the nickname from the 'nickname' object store
      request.onsuccess = () => {
        if (request.result.length < 1) {
          reject();
        } else {
          resolve(request.result[0].nickname);
        }
        db.close();
      };
    };
  });
};

// Function that sets a new nickname for the user in the indexedDB
const setNickname = (newNickname) => {
  return new Promise((resolve) => {
    const dbOpenRequest = window.indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      // If the "nickname" object store doesn't exist, create it with a keyPath of "nickname"
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

      if (!db.objectStoreNames.contains("syncWhenOnlinePostEdits")) {
        db.createObjectStore("syncWhenOnlinePostEdits", { keyPath: "_id" });
      }
    };

    dbOpenRequest.onsuccess = () => {
      // Puts the new nickname into the object store
      const db = dbOpenRequest.result;
      const transaction = db.transaction("nickname", "readwrite");
      const store = transaction.objectStore("nickname");
      store.put({ nickname: newNickname });
      transaction.oncomplete = () => {
        resolve();
        db.close();
        window.location.reload();
      };
    };
  });
};

//Function that handles saving the new nickname entered by the user
const handleSave = () => {
  // Retrieves the value of the input field
  const newNickname = $("#nickname-collector input").val();

  // If the nickname is empty, change the button color and text to indicate an error
  if (newNickname.length <= 0) {
    $("#nickname-collector button").css(
      "background-color",
      "rgb(248, 114, 114)"
    );
    $("#nickname-collector button").css("color", "rgb(71, 0, 0)");
  } else {
    $("#nickname-collector").hide();
    $("body").css("overflow-y", "auto");

    // Call the setNickname function to save the new nickname
    setNickname(newNickname);
  }
};

// Try to get the user's nickname
try {
  await getNickname();
} catch (error) {
  $("#nickname-collector").css("display", "flex");
  $("body").css("overflow-y", "hidden");

  $("#nickname-collector button").click(handleSave);
  $("#nickname-collector input").keydown((e) => {
    if (e.key === "Enter") {
      handleSave();
      return false;
    }
  });
}

// Export the getNickname and setNickname functions for use elsewhere
export { getNickname, setNickname };

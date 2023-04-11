const addToObjectStore = (data, storeName) => {
  return new Promise((resolve) => {
    const dbOpenRequest = indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      if (!db.objectStoreNames.contains("nickname")) {
        db.createObjectStore("nickname", { keyPath: "nickname" });
      }

      if (!db.objectStoreNames.contains("syncWhenOnlineNewPosts")) {
        db.createObjectStore("syncWhenOnlineNewPosts", { autoIncrement: true });
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
        db.createObjectStore("syncWhenOnlineNewPosts", { autoIncrement: true });
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
        db.createObjectStore("syncWhenOnlineNewPosts", { autoIncrement: true });
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
        db.createObjectStore("syncWhenOnlineNewPosts", { autoIncrement: true });
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
        db.createObjectStore("syncWhenOnlineNewPosts", { autoIncrement: true });
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

export {
  addToObjectStore,
  clearObjectStore,
  getByIdFromObjectStore,
  updateByIdInObjectStore,
  getAllFromObjectStore,
};

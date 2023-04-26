// Function to add data to an object store
const addToObjectStore = (data, storeName) => {
  return new Promise((resolve) => {
    // Open a connection to the indexedDB database
    const dbOpenRequest = indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      // Create object stores if they don't exist
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

    // When the database is successfully opened, add the data to the specified object store
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

// Function to get data by id from an object store
const getByIdFromObjectStore = (id, storeName) => {
  return new Promise((resolve) => {
    // Open a connection to the indexedDB database
    const dbOpenRequest = indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      // Create object stores if they don't exist
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

    // When the database is successfully opened, get the data from the specified object store
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

// Function to update data by id in an object store
const updateByIdInObjectStore = (id, data, storeName) => {
  // Creates a promise to return the result of the database operation
  return new Promise((resolve) => {
    // Opens a connection to the "birdWatcher" database
    const dbOpenRequest = indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      // Creates object stores for the different types of data
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

    // Adds the data to the specified object store in the database
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
//Function to get all information from the objects
const getAllFromObjectStore = (storeName) => {
  return new Promise((resolve) => {
    // Opens a connection to the "birdWatcher" database
    const dbOpenRequest = indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      // creates object stores for the different types of data
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

    // Adds the data to the specified object store in the database
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

//Function to clear object stores
const clearObjectStore = (storeName) => {
  return new Promise((resolve) => {
    // Opens a connection to the "birdWatcher" database
    const dbOpenRequest = indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      // Creates object stores for the different types of data
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

    // Adds the data to the specified object store in the database
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

// Export the functions as a module
export {
  addToObjectStore,
  clearObjectStore,
  getByIdFromObjectStore,
  updateByIdInObjectStore,
  getAllFromObjectStore,
};

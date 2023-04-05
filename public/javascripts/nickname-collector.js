const dbOpenRequest = window.indexedDB.open("birdWatcher");

dbOpenRequest.onupgradeneeded = () => {
  const db = dbOpenRequest.result;

  if (!db.objectStoreNames.contains("nickname")) {
    db.createObjectStore("nickname", { keyPath: "nickname" });
  }

  //   if (!db.objectStoreNames.contains("sightings")) {
  //     db.createObjectStore("sightings");
  //   }
};

dbOpenRequest.onsuccess = () => {
  const db = dbOpenRequest.result;
  const transaction = db.transaction("nickname", "readwrite");
  const store = transaction.objectStore("nickname");
  const request = store.getAll();

  request.onsuccess = () => {
    if (request.result.length < 1) {
      $("#nickname-collector").css("display", "flex");

      $("#nickname-collector button").click(() => {
        const newNickname = $("#nickname-collector input").val();

        if (newNickname.length <= 0) {
          $("#nickname-collector button").css(
            "background-color",
            "rgb(248, 114, 114)"
          );
          $("#nickname-collector button").css("color", "rgb(71, 0, 0)");
        } else {
          $("#nickname-collector").hide();

          const transaction = db.transaction("nickname", "readwrite");
          const store = transaction.objectStore("nickname");
          store.put({ nickname: newNickname });
          transaction.oncomplete = () => db.close();
        }
      });
    }
  };
};

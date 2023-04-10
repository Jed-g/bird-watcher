oninstall = () => {
  console.log("Service worker installed");
  self.skipWaiting();
};

onactivate = () => {
  console.log("Service worker activated");
  self.clients.claim();
};

const handleRecent = async (request) => {
  return fetch(request);
};

const handleAdd = async (request) => {
  return fetch(request);
};

const handleViewPost = async (request) => {
  return fetch(request);
};

const handleSendMessage = async (request) => {
  return fetch(request);
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
          return fetch(e.request);
      }
    })()
  );
};

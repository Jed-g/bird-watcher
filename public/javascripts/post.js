import { getNickname } from "./nickname-collector.js";

let nickname = "";
const socket = io();

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (params, key) => params.get(key),
});

socket.emit("joinRoom", { postId: params.id });
socket.on("message", (data) => loadNewChatMessage(data));

const loadChatMessages = (chat) => {
  chat.forEach(({ userNickname, message, date: dateString }) => {
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

const loadNewChatMessage = ({ message, nickname: messageAuthor }) => {
  const date = new Date();

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

const insertDataIntoDOM = ({
  description,
  userNickname,
  date: dateString,
  chat,
}) => {
  const date = new Date(dateString);
  $("#date-desktop").text(
    date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
  );
  $("#date-mobile").text(
    date.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })
  );
  $("#user").text(userNickname);
  $(".description").text(description.length > 0 ? description : "NONE");

  loadChatMessages(chat);
};

const handleMessageSubmit = async () => {
  const message = $("#send-message").val();
  $("#send-message").val("");

  if (message.length > 0 && nickname.length > 0) {
    socket.emit("message", { postId: params.id, message, nickname });

    // There has to be a seperate HTTP request since service workers cannot normally intercept web sockets
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId: params.id,
        message,
        nickname,
        date: new Date(),
      }),
    };

    const response = await fetch("/api/message", requestOptions);
    if (response.ok) {
      loadNewChatMessage({ message, nickname });
    }
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

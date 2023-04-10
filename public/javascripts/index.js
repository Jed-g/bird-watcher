const insertDataIntoDOM = (data) => {
  data.forEach(({ date: dateString, userNickname, _id }) => {
    const date = new Date(dateString);
    const cloned = $("#initial-row").clone(true);
    cloned.removeAttr("id");
    cloned.removeClass("hidden");
    cloned.children(":nth-child(1)").text("test");
    cloned.children(":nth-child(2)").text(
      date.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    );
    cloned.children(":nth-child(3)").text(userNickname);
    cloned
      .children(":nth-child(4)")
      .children(":first")
      .attr("href", "/post?id=" + _id);
    cloned.appendTo("tbody");
  });
};

(async () => {
  const response = await fetch("/api/recent");
  const data = await response.json();

  insertDataIntoDOM(data);
})();

const insertDataIntoTable = (data) => {
  data.forEach(({ date: dateString, authorNickname }) => {
    const date = new Date(dateString);
    const cloned = $("#initial-row").clone(true);
    cloned.removeAttr("id");
    cloned.removeClass("hidden");
    cloned.children(":nth-child(1)").text("test");
    cloned
      .children(":nth-child(2)")
      .text(date.toLocaleString("en-GB", { timeZone: "UTC" }));
    cloned.children(":nth-child(3)").text(authorNickname);
    cloned.children(":nth-child(4)").children(":first").attr("href", "/nearby");
    cloned.appendTo("tbody");
  });
};

(async () => {
  const response = await fetch("/api/recent");
  const data = await response.json();

  insertDataIntoTable(data);
})();

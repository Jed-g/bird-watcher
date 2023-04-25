/**
 * Inserts data into the DOM table.
 *
 * @param {Array} data - The array of data to be inserted.
 * @param {string} data.date - The date string of the data.
 * @param {string} data.userNickname - The user's nickname.
 * @param {string} data._id - The ID of the data.
 */
const insertDataIntoDOM = (data) => {
  data.forEach(({ date: dateString, userNickname, _id, identified, label }) => {
    const date = new Date(dateString);
    const cloned = $("#initial-row").clone(true);
    cloned.removeAttr("id");
    cloned.removeClass("hidden");
    const labelText = identified ? label : "UNKNOWN";
    cloned
      .children(":nth-child(1)")
      .text(labelText.length > 20 ? labelText.slice(0, 17) + "..." : labelText);
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
  $("#initial-row").remove();
};

(async () => {
  const response = await fetch("/api/recent");
  const data = await response.json();

  insertDataIntoDOM(data);
})();

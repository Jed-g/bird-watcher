import { getNickname } from "./nickname-collector.js";

/**
 * Inserts data into the DOM table.
 *
 * @param {Array} data - The array of data to be inserted.
 * @param {string} data.date - The date string of the data.
 * @param {string} data.userNickname - The user's nickname.
 * @param {string} data._id - The ID of the data.
 */
const insertDataIntoDOM = (data, currentNickname) => {
  // Loop through the array of data and extract the necessary information.
  data.forEach(({ date: dateString, userNickname, _id, identified, label }) => {
    const date = new Date(dateString);
    // Clone the initial row and remove the ID and the "hidden" class from it.
    const cloned = $("#initial-row").clone(true);
    cloned.removeAttr("id");
    cloned.removeClass("hidden");

    if (userNickname === currentNickname) {
      cloned
        .children(":nth-child(1)")
        .html("<p class='checkmark text-xl'>✓</p>");
    }

    // Set the label text of the post. If the post is identified, use the label provided, otherwise use "UNKNOWN".
    const labelText = identified ? label : "UNKNOWN";
    cloned
      .children(":nth-child(2)")
      .text(labelText.length > 20 ? labelText.slice(0, 17) + "..." : labelText);
    // Set the date and time of the post using the Date object.
    cloned.children(":nth-child(3)").text(
      date.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    );
    // Set the user nickname of the post.
    cloned.children(":nth-child(4)").text(userNickname);
    // Set the href attribute of the post link to include the post ID.
    cloned
      .children(":nth-child(5)")
      .children(":first")
      .attr("href", "/post?id=" + _id);
    cloned.appendTo("tbody");
  });
  $("#initial-row").remove();
};

// Fetch the recent data from the server and insert it into the DOM table.
(async () => {
  const response = await fetch("/api/recent");
  const data = await response.json();
  const currentNickname = await getNickname();

  insertDataIntoDOM(data, currentNickname);
})();

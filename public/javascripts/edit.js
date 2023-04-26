import { getNickname } from "./nickname-collector.js";
import {
  getByIdFromObjectStore,
  updateByIdInObjectStore,
} from "./indexeddb.js";

// This function generates a SPARQL query string with a keyword parameter.
const searchQuery = (keyword) =>
  encodeURIComponent(`SELECT DISTINCT ?uri ?label
WHERE {
?uri rdfs:label ?label .
?uri dbo:wikiPageWikiLink dbr:Bird .
?uri rdf:type dbo:Bird .
FILTER regex(str(?label), "${keyword}", "i")
FILTER (langMatches(lang(?label), "en"))
}
LIMIT 50`);

let suggestions = [];
let selected = 0;
let unknown = false;
let offline = !navigator.onLine;

$("#back-button").attr("href", "/post" + window.location.search);

// This function updates the autocomplete list by iterating through the suggestions array and adding HTML elements to the DOM.
const updateAutocomplete = () => {
  selected = 0;
  $("#autocomplete").empty();
  suggestions.forEach(({ label }, i) => {
    if (i === 0) {
      $("#autocomplete").append(
        $("<li>").html(`<a class="active">${label}</a>`)
      );
    } else {
      $("#autocomplete").append($("<li>").html(`<a>${label}</a>`));
    }
    $("#autocomplete")
      .children()
      .last()
      .click(() => {
        // When a suggestion is clicked, the input field loses focus, the fetchAutocomplete function is called, and the input field is updated with the selected label.
        $("#identification").blur();
        fetchAutocomplete(suggestions[i].label);
        $("#identification").val(suggestions[i].label);
      });
  });
};

// This function changes the selected suggestion in the autocomplete list.
const changeAutocompleteSelected = (newSelected) => {
  selected = newSelected;

  // Removing the active class from all suggestions and adding it to the newly selected suggestion.
  $("#autocomplete a").removeClass("active");
  $("#autocomplete")
    .children(`:nth-child(${newSelected + 1})`)
    .children()
    .addClass("active");

  $("#autocomplete")
    .children(`:nth-child(${newSelected + 1})`)
    .children()
    .get(0)
    .scrollIntoView({ block: "nearest" });
};

// This function fetches suggestions from a remote SPARQL endpoint.
const fetchAutocomplete = async (newValue) => {
  try {
    const response = await fetch(
      "https://dbpedia.org/sparql?format=json&query=" + searchQuery(newValue)
    );

    const data = (await response.json()).results.bindings;

    // Parsing the response data and storing the suggestions in the suggestions array.
    suggestions = data.map((element) => ({
      label: element.label.value,
      uri: element.uri.value,
    }));

    if ($("#identification").val().length <= 0) {
      $("#autocomplete").empty();
      suggestions = [];
    } else {
      updateAutocomplete();
    }
  } catch (error) {
    offline = true;
    $("#unknown").click();
  }
};

// This event handler is called when the value of the input field changes.
$("#identification").on("input", (e) => {
  const newValue = e.target.value;
  fetchAutocomplete(newValue);
});

$("#autocomplete").on("mousedown", (e) => e.preventDefault());
$("#identification").focus(() => $("#autocomplete").css("display", "block"));
$("#identification").blur(() => {
  suggestions[selected] !== undefined &&
    $("#identification").val(suggestions[selected].label);
  suggestions[selected] !== undefined &&
    fetchAutocomplete(suggestions[selected].label);
  $("#autocomplete").css("display", "none");
});
$("#identification").keydown((e) => {
  if (e.key === "Enter") {
    $("#identification").val(suggestions[selected].label);
    $("#identification").blur();
    fetchAutocomplete(suggestions[selected].label);
    return false;
  }

  // If the ArrowUp key is pressed and a suggestion above the current one is available, update the selected suggestion.
  if (e.key === "ArrowUp") {
    selected > 0 && changeAutocompleteSelected(selected - 1);
    return false;
  }

  // If the ArrowDown key is pressed and a suggestion below the current one is available, update the selected suggestion.
  if (e.key === "ArrowDown") {
    selected < suggestions.length - 1 &&
      changeAutocompleteSelected(selected + 1);
    return false;
  }
});

$("#unknown").click(() => {
  if (offline) {
    // If the application is offline, disable the input and update the unknown button text.
    $("#identification").val("Unavailable when offline...");
    $("#identification").attr("disabled", true);
    $("#unknown").addClass("btn-disabled");
    $("#unknown").removeClass("btn-primary");
    $("#unknown").removeClass("btn-accent");
    $("#unknown").text("Offline");
    suggestions = [];
    updateAutocomplete();
    unknown = true;
  } else if (!unknown) {
    // If the identification is not set to unknown, update the input value and unknown button text.
    unknown = true;
    $("#identification").val("UNKNOWN");
    $("#identification").attr("disabled", true);
    $("#unknown").text("Identify");
    $("#unknown").removeClass("btn-accent");
    $("#unknown").addClass("btn-primary");
    suggestions = [];
    updateAutocomplete();
  } else {
    // If the identification is set to unknown, enable the input and update the unknown button text.
    unknown = false;
    unknown = false;
    $("#identification").val("");
    $("#identification").attr("disabled", null);
    $("#unknown").text("Unknown");
    $("#unknown").addClass("btn-accent");
    $("#unknown").removeClass("btn-primary");
    suggestions = [];
    updateAutocomplete();
  }
});

navigator.onLine || $("#unknown").click();

window.addEventListener("offline", () => {
  offline = true;
  $("#unknown").click();
});
$("#form").submit(async (e) => {
  e.preventDefault();

  $("#identification-error").addClass("hidden");

  let valid = true;

  // If the user hasn't selected "unknown" and the selected species isn't in the suggestion list, show an error message.
  if (!unknown && suggestions[selected] === undefined) {
    $("#identification-error").removeClass("hidden");
    valid = false;
  }

  if (!valid) {
    return;
  }

  let nickname;

  try {
    nickname = await getNickname(); // Calls getNickname() function and assigns the returned value to nickname variable.
  } catch (error) {
    console.error("Nickname not defined");
  }

  const payload = {};

  // If the selected suggestion has a URI, add it to the payload object.
  if (suggestions[selected] !== undefined) {
    payload.identificationURI = suggestions[selected].uri;
  }

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };

  const response = await fetch(
    "/api/edit" + window.location.search,
    requestOptions
  );

  if (!response.ok) {
    $(":submit").css("backgroundColor", "red");
  } else {
    window.location.href = "/post" + window.location.search;
  }
});

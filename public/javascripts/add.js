import { getNickname } from "./nickname-collector.js";

const localeEn = {
  days: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthsShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  today: "Today",
  clear: "Clear",
  dateFormat: "MM/dd/yyyy",
  timeFormat: "hh:mm aa",
  firstDay: 0,
};

new AirDatepicker("#date", {
  locale: localeEn,
  isMobile: true,
  autoClose: true,
  selectedDates: [new Date()],
  timepicker: true,
});

$("#form").submit(async (e) => {
  e.preventDefault();

  const date = $("#date").val();
  const description = $("#description").val();
  const timeZoneOffset = new Date().getTimezoneOffset();

  let nickname;

  try {
    nickname = await getNickname();
  } catch (error) {
    console.error("Nickname not defined");
  }

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, description, timeZoneOffset }),
  };

  const response = await fetch("/add", requestOptions);

  if (!response.ok) {
    document.querySelector("#form button").style.backgroundColor = "red";
  } else {
    window.location.assign(response.url);
  }
});

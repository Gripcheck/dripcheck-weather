console.log("DripCheck Weather App Loaded");

const input = document.getElementById("cityInput");
const stateInput = document.getElementById("stateInput");
const button = document.getElementById("searchBtn");
const text = document.getElementById("weatherResult");

const apiKey = "20494173ef27fe0a59000a90ec222bf8";

button.addEventListener("click", async function () {
  const city = input.value.trim();
  const stateCode = stateInput.value.trim().toUpperCase();

  if (city === "" || stateCode === "") {
    text.innerHTML = `<p>Please enter a city and state code.</p>`;
    return;
  }

  text.innerHTML = `<p>Weather for ${city}, ${stateCode} loading...</p>`;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${stateCode},US&appid=${apiKey}&units=imperial`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      text.innerHTML = `<p>${data.message}</p>`;
      return;
    }

    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    text.innerHTML = `
      <h2>${data.name}, ${stateCode}</h2>
      <img src="${iconUrl}" alt="${data.weather[0].description}">
      <p>Temperature: ${Math.round(data.main.temp)}°F</p>
      <p>Condition: ${data.weather[0].description}</p>
      <p>Humidity: ${data.main.humidity}%</p>
    `;
  } catch (error) {
    text.innerHTML = `<p>Something went wrong. Please try again.</p>`;
    console.log(error);
  }
});

input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    button.click();
  }
});

stateInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    button.click();
  }
});

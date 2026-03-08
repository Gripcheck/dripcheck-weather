console.log("DripCheck Weather App Loaded");

const cityInput = document.getElementById("cityInput");
const stateInput = document.getElementById("stateInput");
const button = document.getElementById("searchBtn");
const text = document.getElementById("weatherResult");

const apiKey = "20494173ef27fe0a59000a90ec222bf8";

async function getWeatherByCity() {
  const city = cityInput.value.trim();
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

    displayWeather(data, stateCode);
  } catch (error) {
    text.innerHTML = `<p>Something went wrong. Please try again.</p>`;
    console.log(error);
  }
}

async function getWeatherByCoords(lat, lon) {
  text.innerHTML = `<p>Getting weather for your location...</p>`;

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      text.innerHTML = `<p>${data.message}</p>`;
      return;
    }

    displayWeather(data);
  } catch (error) {
    text.innerHTML = `<p>Unable to get local weather.</p>`;
    console.log(error);
  }
}

function displayWeather(data, stateCode = "") {
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  const weatherType = data.weather[0].main;

  updateBackground(weatherType);

  text.innerHTML = `
    <div class="weather-card">
      <h2>${data.name}${stateCode ? `, ${stateCode}` : ""}</h2>
      <img src="${iconUrl}" alt="${data.weather[0].description}">
      <p><strong>Temperature:</strong> ${Math.round(data.main.temp)}°F</p>
      <p><strong>Feels Like:</strong> ${Math.round(data.main.feels_like)}°F</p>
      <p><strong>Condition:</strong> ${data.weather[0].description}</p>
      <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
      <p><strong>Wind:</strong> ${Math.round(data.wind.speed)} mph</p>
    </div>
  `;
}

function updateBackground(weatherType) {
  if (weatherType === "Clear") {
    document.body.style.background =
      "linear-gradient(135deg, #4facfe, #00f2fe)";
  } else if (weatherType === "Clouds") {
    document.body.style.background =
      "linear-gradient(135deg, #bdc3c7, #2c3e50)";
  } else if (weatherType === "Rain" || weatherType === "Drizzle") {
    document.body.style.background =
      "linear-gradient(135deg, #4b6cb7, #182848)";
  } else if (weatherType === "Snow") {
    document.body.style.background =
      "linear-gradient(135deg, #e6dada, #274046)";
  } else if (weatherType === "Thunderstorm") {
    document.body.style.background =
      "linear-gradient(135deg, #232526, #414345)";
  } else {
    document.body.style.background =
      "linear-gradient(135deg, #0f172a, #1e293b)";
  }
}

button.addEventListener("click", getWeatherByCity);

cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    button.click();
  }
});

stateInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    button.click();
  }
});

window.addEventListener("load", function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByCoords(lat, lon);
      },
      function () {
        text.innerHTML = `<p>Location access denied. Search by city and state.</p>`;
      },
    );
  } else {
    text.innerHTML = `<p>Geolocation is not supported by this browser.</p>`;
  }
});

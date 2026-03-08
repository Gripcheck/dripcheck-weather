console.log("DripCheck Weather App Loaded");

const cityInput = document.getElementById("cityInput");
const stateInput = document.getElementById("stateInput");
const button = document.getElementById("searchBtn");
const text = document.getElementById("weatherResult");
const locationBtn = document.getElementById("locationBtn");

stateInput.addEventListener("input", function () {
  stateInput.value = stateInput.value.toUpperCase().slice(0, 2);
});

function showLoading(message) {
  text.innerHTML = `
    <div class="spinner"></div>
    <p class="loading-text">${message}</p>
  `;
}

function updateBackground(weatherType) {
  document.body.classList.remove(
    "weather-clear",
    "weather-clouds",
    "weather-rain",
    "weather-snow",
    "weather-storm",
  );

  if (weatherType === "Clear") {
    document.body.classList.add("weather-clear");
  } else if (weatherType === "Clouds") {
    document.body.classList.add("weather-clouds");
  } else if (weatherType === "Rain" || weatherType === "Drizzle") {
    document.body.classList.add("weather-rain");
  } else if (weatherType === "Snow") {
    document.body.classList.add("weather-snow");
  } else if (weatherType === "Thunderstorm") {
    document.body.classList.add("weather-storm");
  }
}

function displayWeather(data, stateCode = "", forecastHtml = "") {
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  const weatherType = data.weather[0].main;

  updateBackground(weatherType);

  text.innerHTML = `
    <div class="weather-card">
      <h2>${data.name}${stateCode ? `, ${stateCode}` : ""}</h2>

      <p class="hero-temp">${Math.round(data.main.temp)}°F</p>
      <p class="hero-condition">${data.weather[0].description}</p>

      <img src="${iconUrl}" alt="${data.weather[0].description}">

      <div class="weather-details">
        <p><strong>Feels Like:</strong> ${Math.round(data.main.feels_like)}°F</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind:</strong> ${Math.round(data.wind.speed)} mph</p>
      </div>

      ${forecastHtml}
    </div>
  `;
}

function buildForecastHTML(forecastData) {
  const dailyForecasts = forecastData.list
    .filter(function (item) {
      return item.dt_txt.includes("12:00:00");
    })
    .slice(0, 5);

  const cards = dailyForecasts
    .map(function (day) {
      const date = new Date(day.dt_txt);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;

      return `
        <div class="forecast-day">
          <p class="forecast-day-name">${dayName}</p>
          <img src="${icon}" alt="${day.weather[0].description}">
          <p>${Math.round(day.main.temp)}°F</p>
        </div>
      `;
    })
    .join("");

  return `
    <div class="forecast">
      <h3>5-Day Forecast</h3>
      <div class="forecast-grid">
        ${cards}
      </div>
    </div>
  `;
}

async function getForecastByCity(city, stateCode) {
  const forecastUrl = `/.netlify/functions/weather?city=${encodeURIComponent(city)}&state=${encodeURIComponent(stateCode)}&type=forecast`;

  const response = await fetch(forecastUrl);
  const data = await response.json();

  if (data.cod !== "200") {
    return "";
  }

  return buildForecastHTML(data);
}

async function getForecastByCoords(lat, lon) {
  const forecastUrl = `/.netlify/functions/weather?lat=${lat}&lon=${lon}&type=forecast`;

  const response = await fetch(forecastUrl);
  const data = await response.json();

  if (data.cod !== "200") {
    return "";
  }

  return buildForecastHTML(data);
}

async function getWeatherByCity() {
  const city = cityInput.value.trim();
  const stateCode = stateInput.value.trim().toUpperCase();

  if (city === "" || stateCode === "") {
    text.innerHTML = `<p>Please enter a city and state code.</p>`;
    return;
  }

  localStorage.setItem("lastCity", city);
  localStorage.setItem("lastState", stateCode);

  showLoading(`Loading weather for ${city}, ${stateCode}...`);

  const url = `/.netlify/functions/weather?city=${encodeURIComponent(city)}&state=${encodeURIComponent(stateCode)}&type=weather`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      text.innerHTML = `<p>${data.message}</p>`;
      return;
    }

    const forecastHtml = await getForecastByCity(city, stateCode);
    displayWeather(data, stateCode, forecastHtml);
  } catch (error) {
    text.innerHTML = `<p>Something went wrong. Please try again.</p>`;
    console.log(error);
  }
}

async function getWeatherByCoords(lat, lon) {
  showLoading("Getting weather for your location...");

  const url = `/.netlify/functions/weather?lat=${lat}&lon=${lon}&type=weather`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      text.innerHTML = `<p>${data.message}</p>`;
      return;
    }

    const forecastHtml = await getForecastByCoords(lat, lon);
    displayWeather(data, "", forecastHtml);
  } catch (error) {
    text.innerHTML = `<p>Unable to get local weather.</p>`;
    console.log(error);
  }
}

button.addEventListener("click", getWeatherByCity);

locationBtn.addEventListener("click", function () {
  if (navigator.geolocation) {
    showLoading("Getting weather for your location...");

    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByCoords(lat, lon);
      },
      function () {
        text.innerHTML = `<p>Unable to access your location.</p>`;
      },
    );
  } else {
    text.innerHTML = `<p>Geolocation is not supported by this browser.</p>`;
  }
});

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
  const lastCity = localStorage.getItem("lastCity");
  const lastState = localStorage.getItem("lastState");

  if (lastCity) cityInput.value = lastCity;
  if (lastState) stateInput.value = lastState;

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
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(function () {
        console.log("Service Worker Registered");
      })
      .catch(function (err) {
        console.log("Service Worker Failed", err);
      });
  });
}

exports.handler = async function (event) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  const city = event.queryStringParameters.city;
  const state = event.queryStringParameters.state;
  const lat = event.queryStringParameters.lat;
  const lon = event.queryStringParameters.lon;
  const type = event.queryStringParameters.type || "weather";

  let url = "";

  if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/${type}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
  } else if (city && state) {
    url = `https://api.openweathermap.org/data/2.5/${type}?q=${city},${state},US&appid=${apiKey}&units=imperial`;
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required parameters." }),
    };
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error." }),
    };
  }
};

const apiKey = "e93eb9cbb9b6b279973bf2acde3185b5";

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const weatherResult = document.getElementById("weatherResult");
  const forecastDiv = document.getElementById("forecast");
  const extraInfo = document.getElementById("extraInfo");

  if (!city) {
    weatherResult.innerHTML = "Please enter a city name.";
    return;
  }

  try {
    // Step 1: Get current weather (with coordinates)
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    if (!currentRes.ok) throw new Error("City not found");
    const currentData = await currentRes.json();

    const { name, main, weather, coord } = currentData;
    const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    weatherResult.innerHTML = `
      <img src="${iconUrl}" />
      <h2>${name}</h2>
      <p><strong>${weather[0].main}</strong> - ${weather[0].description}</p>
      <p><strong>Temperature:</strong> ${main.temp}°C</p>
      <p><strong>Humidity:</strong> ${main.humidity}%</p>
    `;

    // Step 2: Get 5-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastRes.json();

    // Group by day (every 3 hours → take 1/day)
    let daily = {};
    forecastData.list.forEach(entry => {
      const date = entry.dt_txt.split(" ")[0];
      if (!daily[date]) {
        daily[date] = entry;
      }
    });

    forecastDiv.innerHTML = `<h3>5-Day Forecast</h3>`;
    Object.keys(daily).slice(0, 5).forEach(date => {
      const d = daily[date];
      const day = new Date(d.dt_txt).toLocaleDateString("en-IN", { weekday: "short" });
      forecastDiv.innerHTML += `
        <div class="forecast-day">
          <div><strong>${day}</strong></div>
          <img src="http://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png" />
          <div>${Math.round(d.main.temp)}°C</div>
        </div>
      `;
    });

    // Step 3: Get air quality
    const aqiRes = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`
    );
    const aqiData = await aqiRes.json();
    const aqi = aqiData.list[0].main.aqi;
    const aqiStatus = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];

    // Step 4: Get UV Index using One Call API
    const oneCallRes = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=minutely,hourly,daily,alerts&appid=${apiKey}&units=metric`
    );
    const oneCallData = await oneCallRes.json();
    const uv = oneCallData.current.uvi;

    extraInfo.innerHTML = `
      <p><strong>Air Quality Index:</strong> ${aqi} (${aqiStatus[aqi - 1]})</p>
      <p><strong>UV Index:</strong> ${uv}</p>
    `;
} catch (error) {
  console.error("Weather fetch error:", error);

  // Only show error if no data was displayed before
  if (!weatherResult.innerHTML.includes("Temperature")) {
    weatherResult.innerHTML = "City not found or API error.";
    forecastDiv.innerHTML = "";
    extraInfo.innerHTML = "";
  }
}

}


function updateDateTime() {
  const now = new Date();
  const formatted = now.toLocaleString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  document.getElementById("dateTime").textContent = formatted;
}
setInterval(updateDateTime, 1000);
updateDateTime();

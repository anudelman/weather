const openWeatherApiKey = '90feb339669a5a15ccbb64314564e9dd';

// Initialize Algolia
const searchClient = algoliasearch("90OQHOCLYE", "7d2ae762429c13a838c5c84b8055d485");
const index = searchClient.initIndex("us_cities"); // Replace with your index name

const searchBox = document.getElementById("searchbox");
const resultsContainer = document.getElementById("autocomplete-results");

// Listen for input and fetch search results
searchBox.addEventListener("input", async function () {
  let query = searchBox.value.trim();
  if (query.length < 2) {
    resultsContainer.innerHTML = ""; // Clear results if query is too short
    return;
  }

  try {
    const { hits } = await index.search(query, { hitsPerPage: 5 });

    resultsContainer.innerHTML = hits
      .map(hit => `<div class="search-result" onclick="fetchWeather('${hit.name}', ${hit._geoloc.lat}, ${hit._geoloc.lng})">${hit.name}, ${hit.state}</div>`)
      .join("");

  } catch (error) {
    console.error("Algolia search error:", error);
  }
});

// Fetch OpenWeather Data when city is selected
async function fetchWeather(city, latValue, lonValue) {
  lat = latValue;
  lon = lonValue;
  await updateWeatherByLocation(latValue, lonValue, { label: city });
  resultsContainer.innerHTML = ""; // Clear search results after selection
}

// Declare lat in a higher scope
let lat;
let lon;

async function updateWeatherByLocation(latitude, longitude, { label, updateSearchInput = true } = {}) {
  lat = latitude;
  lon = longitude;

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=imperial`;

  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();

    const displayName = data.name || label || 'Selected Location';

    document.getElementById("city-temp").innerHTML = `
      <h1>${displayName}</h1>
      <h2>${Math.round(data.main.temp)}°<span style="font-size: 0.5em; vertical-align: super;">F</span>, ${data.weather[0].description}</h2>
    `;

    // Cache the response
    localStorage.setItem('lastWeather', JSON.stringify(data));

    if (updateSearchInput) {
      const inputValue = label || displayName;
      searchBox.value = inputValue;
    }

    resultsContainer.innerHTML = "";

    // Fetch forecast data after updating current weather
    getTenDayForecast();
    getHourlyForecast();
    updateWeatherCards(lat, lon);

    return true;
  } catch (error) {
    console.error("Weather fetch error:", error);

    const cached = localStorage.getItem('lastWeather');
    if (cached) {
      const data = JSON.parse(cached);
      const cachedName = data.name || label || 'Selected Location';
      document.getElementById("city-temp").innerHTML = `
        <h1>${cachedName}</h1>
        <h2>${Math.round(data.main.temp)}°<span style="font-size: 0.5em; vertical-align: super;">F</span> (cached), ${data.weather[0].description}</h2>
      `;
      return false;
    }

    const fallbackName = label || 'your location';
    document.getElementById("city-temp").innerHTML = `
      <h1>${fallbackName}</h1>
      <h2>Unable to fetch weather data. Please check your connection.</h2>
    `;

    return false;
  }
}

async function fetchWeatherByCoordinates(latitude, longitude, options = {}) {
  return updateWeatherByLocation(latitude, longitude, options);
}

// Function to make the first API call and get latitude
function getLatitudeAndLongitude(city = 'Deerfield', state = 'IL') {
  return axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${openWeatherApiKey}`)
    .then((response) => {
      const locationData = response.data;
      if (!Array.isArray(locationData) || locationData.length === 0) {
        throw new Error('Location not found');
      }

      lat = locationData[0].lat; // Store lat globally
      lon = locationData[0].lon;
      return {
        lat,
        lon,
        label: `${locationData[0].name}${locationData[0].state ? `, ${locationData[0].state}` : ''}`
      };
    });
}

function getTenDayForecast() {
  if (!lat || !lon) {
    console.error('Latitude or Longitude is not available.');
    return;
  }

  // Use One Call API to get daily forecast (up to 8 days on free tier)
  axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${openWeatherApiKey}`)
    .then((res) => {
      const dailyData = res.data.daily;

      // Take up to 10 days (API provides 7-8 days typically)
      const forecastHTML = dailyData.slice(1, 11).map((day, index) => {
        const date = new Date(day.dt * 1000);
        const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
        const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
        const tempMax = Math.round(day.temp.max);
        const tempMin = Math.round(day.temp.min);
        const pop = Math.round(day.pop * 100);

        return `
          <div class="forecast-day">
            <div class="day-header">
              <div class="day">${weekday}</div>
              <div class="date">${monthDay}</div>
            </div>
            <img src="${icon}" alt="${day.weather[0].description}" />
            <div class="temps">${tempMax}° / ${tempMin}°</div>
            <div class="pop">💧 ${pop}%</div>
            <div class="description">${day.weather[0].description}</div>
          </div>
        `;
      }).join("");

      document.getElementById("ten-day-forecast").innerHTML = forecastHTML;
    })
    .catch((e) => {
      console.error("10-day forecast error!", e);
      // Fallback to 5-day forecast API if One Call fails
      getFallbackFiveDayForecast();
    });
}

// Fallback function using the standard 5-day forecast API
function getFallbackFiveDayForecast() {
  axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${openWeatherApiKey}`)
    .then((res) => {
      const forecastData = res.data.list;
      const dailyForecasts = [];

      forecastData.forEach(entry => {
        if (entry.dt_txt.includes("12:00:00")) {
          dailyForecasts.push(entry);
        }
      });

      const forecastHTML = dailyForecasts.slice(0, 5).map(day => {
        const date = new Date(day.dt_txt);
        const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
        const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
        const tempMax = Math.round(day.main.temp_max);
        const tempMin = Math.round(day.main.temp_min);
        const pop = Math.round(day.pop * 100);

        return `
          <div class="forecast-day">
            <div class="day-header">
              <div class="day">${weekday}</div>
              <div class="date">${monthDay}</div>
            </div>
            <img src="${icon}" alt="${day.weather[0].description}" />
            <div class="temps">${tempMax}° / ${tempMin}°</div>
            <div class="pop">💧 ${pop}%</div>
            <div class="description">${day.weather[0].description}</div>
          </div>
        `;
      }).join("");

      document.getElementById("ten-day-forecast").innerHTML = forecastHTML;
    })
    .catch((e) => {
      console.error("Fallback forecast error!", e);
    });
}

// New function to get hourly forecast
function getHourlyForecast() {
  if (!lat || !lon) {
    console.error("Latitude or Longitude is not available.");
    return;
  }
  axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${openWeatherApiKey}`)
    .then(response => {
      // Take the next 4 forecast intervals as an example
      const forecastData = response.data.list.slice(0, 4);
      const hourlyHTML = forecastData.map(hour => {
        const time = new Date(hour.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const icon = `https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`;
        const temp = Math.round(hour.main.temp);
        return `
          <div class="hour">
            <div class="time">${time}</div>
            <img src="${icon}" alt="${hour.weather[0].description}" />
            <div class="temp">${temp}°F</div>
          </div>
        `;
      }).join("");
      document.getElementById("hourly-forecast").innerHTML = hourlyHTML;
    })
    .catch(error => {
      console.error("Hourly forecast error:", error);
    });
}

// Function to make the second API call using lat
// New function to update the weather cards with live data
async function updateWeatherCards(lat, lon) {
  try {
    // Fetch current data from the One Call API
    const oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&units=imperial&appid=${openWeatherApiKey}`;
    const oneCallResponse = await axios.get(oneCallUrl);
    const current = oneCallResponse.data.current;
    
    // Fetch air quality data
    const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`;
    const airQualityResponse = await axios.get(airQualityUrl);
    const aqiData = airQualityResponse.data.list[0];

    // Air Quality
    let aqiValue = aqiData.main.aqi;
    let aqiText = "Unknown";
    if (aqiValue === 1) aqiText = "Good";
    else if (aqiValue === 2) aqiText = "Fair";
    else if (aqiValue === 3) aqiText = "Moderate";
    else if (aqiValue === 4) aqiText = "Poor";
    else if (aqiValue === 5) aqiText = "Very Poor";
    document.querySelector("[data-key='aqi-value']").textContent = `${aqiValue} ${aqiText}`;

    // Precipitation (using 1-hour rain data if available)
    let precipAmount = (current.rain && current.rain["1h"]) ? current.rain["1h"] : 0;
    document.querySelector("[data-key='precip-value']").textContent = `${precipAmount}" in last 1h`;

    // UV Index
    let uv = current.uvi;
    let uvLevel = uv < 3 ? "Low" : uv < 6 ? "Moderate" : "High";
    document.querySelector("[data-key='uv-value']").textContent = `${uv} ${uvLevel}`;

    // Wind
    let windSpeed = Math.round(current.wind_speed);
    let windDeg = current.wind_deg;
    let windDir = degToCompass(windDeg);
    document.querySelector("[data-key='wind-value']").textContent = `${windSpeed} mph`;
    document.querySelector("[data-key='wind-subtext']").textContent = `${windDir} wind`;

    // Humidity
    document.querySelector("[data-key='humidity-value']").textContent = `${current.humidity}%`;

    // Visibility (convert meters to miles)
    let visibilityMiles = current.visibility ? (current.visibility / 1609.34).toFixed(1) : "N/A";
    document.querySelector("[data-key='visibility-value']").textContent = `${visibilityMiles} mi`;

    // Pressure
    document.querySelector("[data-key='pressure-value']").textContent = `${current.pressure} hPa`;

    // Sunrise (convert Unix timestamp to local time)
    let sunriseTime = new Date(current.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.querySelector("[data-key='sunrise-value']").textContent = sunriseTime;
    
  } catch (error) {
    console.error("Error updating weather cards:", error);
  }
}

// Helper to convert wind direction in degrees to cardinal direction
function degToCompass(num) {
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return arr[val % 16];
}

async function initializeDefaultWeather() {
  try {
    const { lat: defaultLat, lon: defaultLon, label } = await getLatitudeAndLongitude();
    await updateWeatherByLocation(defaultLat, defaultLon, { label });
  } catch (error) {
    console.error('Error getting default location:', error);
  }
}

async function requestUserLocation() {
  if (!('geolocation' in navigator)) {
    console.warn('Geolocation is not supported by this browser.');
    return false;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const success = await fetchWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
          resolve(success);
        } catch (error) {
          console.error('Error fetching weather for current location:', error);
          resolve(false);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        resolve(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  });
}

window.addEventListener('load', async () => {
  const usedGeolocation = await requestUserLocation();
  if (!usedGeolocation) {
    await initializeDefaultWeather();
  }
});

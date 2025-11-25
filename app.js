const openWeatherApiKey = '90feb339669a5a15ccbb64314564e9dd';

// Initialize Algolia
const searchClient = algoliasearch("90OQHOCLYE", "7d2ae762429c13a838c5c84b8055d485");
const index = searchClient.initIndex("us_cities");

const searchBox = document.getElementById("searchbox");
const resultsContainer = document.getElementById("autocomplete-results");
const backgroundEl = document.getElementById('background-illustration');

let lat;
let lon;

const backgroundMap = {
  Thunderstorm: 'assets/backgrounds/stormy.svg',
  Drizzle: 'assets/backgrounds/rainy.svg',
  Rain: 'assets/backgrounds/rainy.svg',
  Snow: 'assets/backgrounds/snowy.svg',
  Clear: 'assets/backgrounds/clear-sky.svg',
  Clouds: 'assets/backgrounds/cloudy.svg',
  Mist: 'assets/backgrounds/foggy.svg',
  Fog: 'assets/backgrounds/foggy.svg',
  Haze: 'assets/backgrounds/foggy.svg'
};

// Listen for input and fetch search results
searchBox.addEventListener("input", async function () {
  const query = searchBox.value.trim();
  if (query.length < 2) {
    resultsContainer.innerHTML = "";
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

function updateHero(data, label) {
  const displayName = data.name || label || 'Selected Location';
  const description = data.weather[0].description;
  const high = Math.round(data.main.temp_max);
  const low = Math.round(data.main.temp_min);
  document.getElementById('location-name').textContent = displayName;
  document.getElementById('current-temp').textContent = Math.round(data.main.temp);
  document.getElementById('condition-text').textContent = description;
  document.getElementById('hi-lo').textContent = `H: ${high}°  L: ${low}°`;
  document.getElementById('narrative').textContent = buildNarrative(data);
  updateBackgroundIllustration(data.weather[0]);
}

function buildNarrative(data) {
  const wind = Math.round(data.wind.speed);
  const gust = data.wind.gust ? Math.round(data.wind.gust) : wind + 3;
  const feelsLike = Math.round(data.main.feels_like);
  const humidity = data.main.humidity;
  return `Windy conditions today with gusts up to ${gust} mph. Feels like ${feelsLike}° with humidity at ${humidity}%.`;
}

function updateBackgroundIllustration(weather) {
  const key = backgroundMap[weather.main] ? weather.main : 'Clouds';
  backgroundEl.style.backgroundImage = `url('${backgroundMap[key]}')`;
  backgroundEl.style.opacity = 0.7;
}

// Fetch OpenWeather Data when city is selected
async function fetchWeather(city, latValue, lonValue) {
  lat = latValue;
  lon = lonValue;
  await updateWeatherByLocation(latValue, lonValue, { label: city });
  resultsContainer.innerHTML = "";
}

async function updateWeatherByLocation(latitude, longitude, { label, updateSearchInput = true } = {}) {
  lat = latitude;
  lon = longitude;

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=imperial`;

  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();

    updateHero(data, label);

    // Cache the response
    localStorage.setItem('lastWeather', JSON.stringify(data));

    if (updateSearchInput) {
      const inputValue = label || data.name || 'Selected Location';
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
      updateHero(data, label);
      return false;
    }

    const fallbackName = label || 'your location';
    document.getElementById('location-name').textContent = fallbackName;
    document.getElementById('current-temp').textContent = '--';
    document.getElementById('condition-text').textContent = 'Unable to fetch weather data.';
    document.getElementById('narrative').textContent = 'Please check your connection.';

    return false;
  }
}

async function fetchWeatherByCoordinates(latitude, longitude, options = {}) {
  return updateWeatherByLocation(latitude, longitude, options);
}

function getLatitudeAndLongitude(city = 'Deerfield', state = 'IL') {
  return axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${openWeatherApiKey}`)
    .then((response) => {
      const locationData = response.data;
      if (!Array.isArray(locationData) || locationData.length === 0) {
        throw new Error('Location not found');
      }

      lat = locationData[0].lat;
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

  axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${openWeatherApiKey}`)
    .then((res) => {
      const dailyData = res.data.daily;
      const trimmed = dailyData.slice(1, 6);
      const temps = trimmed.map(day => ({ max: Math.round(day.temp.max), min: Math.round(day.temp.min) }));
      const overallMax = Math.max(...temps.map(t => t.max));
      const overallMin = Math.min(...temps.map(t => t.min));
      const span = Math.max(overallMax - overallMin, 1);

      const forecastHTML = trimmed.map((day, index) => {
        const date = new Date(day.dt * 1000);
        const weekday = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
        const tempMax = Math.round(day.temp.max);
        const tempMin = Math.round(day.temp.min);
        const start = ((tempMin - overallMin) / span) * 100;
        const end = ((tempMax - overallMin) / span) * 100;
        const width = Math.max(end - start, 8);

        return `
          <div class="day-row" role="row">
            <div class="day-label" role="cell">
              <span class="weekday">${weekday}</span>
              <span class="date">${monthDay}</span>
            </div>
            <div class="day-condition" role="cell">
              <img src="${icon}" alt="${day.weather[0].description}" />
              <span class="summary">${day.weather[0].description}</span>
            </div>
            <div role="cell">
              <div class="temp-track">
                <div class="temp-fill" style="left:${start}%; width:${width}%;"></div>
              </div>
              <div class="temp-values">
                <span>${tempMin}°</span>
                <span>${tempMax}°</span>
              </div>
            </div>
          </div>
        `;
      }).join("");

      document.getElementById("ten-day-forecast").innerHTML = forecastHTML;
    })
    .catch((e) => {
      console.error("10-day forecast error!", e);
      getFallbackFiveDayForecast();
    });
}

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

      const temps = dailyForecasts.slice(0, 5).map(day => ({ max: Math.round(day.main.temp_max), min: Math.round(day.main.temp_min) }));
      const overallMax = Math.max(...temps.map(t => t.max));
      const overallMin = Math.min(...temps.map(t => t.min));
      const span = Math.max(overallMax - overallMin, 1);

      const forecastHTML = dailyForecasts.slice(0, 5).map((day, index) => {
        const date = new Date(day.dt_txt);
        const weekday = index === 0 ? 'Today' : date.toLocaleDateString("en-US", { weekday: "short" });
        const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
        const tempMax = Math.round(day.main.temp_max);
        const tempMin = Math.round(day.main.temp_min);
        const start = ((tempMin - overallMin) / span) * 100;
        const end = ((tempMax - overallMin) / span) * 100;
        const width = Math.max(end - start, 8);

        return `
          <div class="day-row" role="row">
            <div class="day-label" role="cell">
              <span class="weekday">${weekday}</span>
              <span class="date">${monthDay}</span>
            </div>
            <div class="day-condition" role="cell">
              <img src="${icon}" alt="${day.weather[0].description}" />
              <span class="summary">${day.weather[0].description}</span>
            </div>
            <div role="cell">
              <div class="temp-track">
                <div class="temp-fill" style="left:${start}%; width:${width}%;"></div>
              </div>
              <div class="temp-values">
                <span>${tempMin}°</span>
                <span>${tempMax}°</span>
              </div>
            </div>
          </div>
        `;
      }).join("");

      document.getElementById("ten-day-forecast").innerHTML = forecastHTML;
    })
    .catch((e) => {
      console.error("Fallback forecast error!", e);
    });
}

function getHourlyForecast() {
  if (!lat || !lon) {
    console.error("Latitude or Longitude is not available.");
    return;
  }
  axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${openWeatherApiKey}`)
    .then(response => {
      const forecastData = response.data.list.slice(0, 8);
      const hourlyHTML = forecastData.map((hour, index) => {
        const time = index === 0 ? 'Now' : new Date(hour.dt_txt).toLocaleTimeString([], { hour: 'numeric' });
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

async function updateWeatherCards(lat, lon) {
  try {
    const oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&units=imperial&appid=${openWeatherApiKey}`;
    const oneCallResponse = await axios.get(oneCallUrl);
    const current = oneCallResponse.data.current;

    const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`;
    const airQualityResponse = await axios.get(airQualityUrl);
    const aqiData = airQualityResponse.data.list[0];

    let aqiValue = aqiData.main.aqi;
    let aqiText = "Unknown";
    if (aqiValue === 1) aqiText = "Good";
    else if (aqiValue === 2) aqiText = "Fair";
    else if (aqiValue === 3) aqiText = "Moderate";
    else if (aqiValue === 4) aqiText = "Poor";
    else if (aqiValue === 5) aqiText = "Very Poor";
    document.querySelector("[data-key='aqi-value']").textContent = `${aqiValue} ${aqiText}`;

    let precipAmount = (current.rain && current.rain["1h"]) ? current.rain["1h"] : 0;
    document.querySelector("[data-key='precip-value']").textContent = `${precipAmount}" in last 1h`;

    let uv = current.uvi;
    let uvLevel = uv < 3 ? "Low" : uv < 6 ? "Moderate" : "High";
    document.querySelector("[data-key='uv-value']").textContent = `${uv} ${uvLevel}`;

    let windSpeed = Math.round(current.wind_speed);
    let windDeg = current.wind_deg;
    let windDir = degToCompass(windDeg);
    document.querySelector("[data-key='wind-value']").textContent = `${windSpeed} mph`;
    document.querySelector("[data-key='wind-subtext']").textContent = `${windDir} wind`;

    document.querySelector("[data-key='humidity-value']").textContent = `${current.humidity}%`;

    let visibilityMiles = current.visibility ? (current.visibility / 1609.34).toFixed(1) : "N/A";
    document.querySelector("[data-key='visibility-value']").textContent = `${visibilityMiles} mi`;

    document.querySelector("[data-key='pressure-value']").textContent = `${current.pressure} hPa`;

    let sunriseTime = new Date(current.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.querySelector("[data-key='sunrise-value']").textContent = sunriseTime;

  } catch (error) {
    console.error("Error updating weather cards:", error);
  }
}

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

document.getElementById('my-location')?.addEventListener('click', async () => {
  const success = await requestUserLocation();
  if (!success) {
    await initializeDefaultWeather();
  }
});

window.addEventListener('load', async () => {
  const usedGeolocation = await requestUserLocation();
  if (!usedGeolocation) {
    await initializeDefaultWeather();
  }
});

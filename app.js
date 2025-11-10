const openWeatherApiKey = '90feb339669a5a15ccbb64314564e9dd';
const city = document.querySelector('#city-temp h1');
const currentTemp = document.querySelector('#city-temp h2');

const searchBox = document.getElementById("searchbox");
const resultsContainer = document.getElementById("autocomplete-results");
const MIN_QUERY_LENGTH = 3;

let locationIndex = [];

fetch('us_cities.json')
  .then((response) => response.json())
  .then((data) => {
    locationIndex = data;
  })
  .catch((error) => {
    console.error('Error loading location index:', error);
  });

searchBox.addEventListener('input', handleSearchInput);
searchBox.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const firstResult = resultsContainer.querySelector('.search-result');
    if (firstResult instanceof HTMLButtonElement) {
      firstResult.click();
    }
  }
});

searchBox.addEventListener('focus', () => {
  if (searchBox.value.trim().length >= MIN_QUERY_LENGTH) {
    handleSearchInput();
  }
});

searchBox.addEventListener('blur', () => {
  setTimeout(() => {
    clearResults();
  }, 150);
});

resultsContainer.addEventListener('click', (event) => {
  const target = event.target.closest('.search-result');
  if (!target || !(target instanceof HTMLButtonElement)) {
    return;
  }

  const selectedLocation = {
    name: target.dataset.name,
    state: target.dataset.state,
    zip: target.dataset.zip,
    lat: parseFloat(target.dataset.lat),
    lon: parseFloat(target.dataset.lon),
  };

  fetchWeather(selectedLocation);
});

function handleSearchInput() {
  const query = searchBox.value.trim();

  if (query.length < MIN_QUERY_LENGTH || !locationIndex.length) {
    clearResults();
    return;
  }

  const isNumericQuery = /^[0-9]+$/.test(query);
  const normalizedQuery = query.toLowerCase();

  const matches = locationIndex
    .filter((location) => {
      if (isNumericQuery) {
        return location.zip && location.zip.startsWith(query);
      }

      const cityState = `${location.name}, ${location.state}`.toLowerCase();
      return (
        location.name.toLowerCase().includes(normalizedQuery) ||
        cityState.includes(normalizedQuery)
      );
    })
    .slice(0, 5);

  renderSearchResults(matches);
}

function renderSearchResults(matches) {
  resultsContainer.innerHTML = '';

  if (!matches.length) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'search-result';
    emptyMessage.textContent = 'No matches found';
    emptyMessage.setAttribute('aria-disabled', 'true');
    emptyMessage.setAttribute('role', 'option');
    emptyMessage.tabIndex = -1;
    resultsContainer.appendChild(emptyMessage);
    resultsContainer.classList.add('active');
    searchBox.setAttribute('aria-expanded', 'true');
    return;
  }

  const fragment = document.createDocumentFragment();

  matches.forEach((location) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'search-result';
    button.dataset.name = location.name;
    button.dataset.state = location.state;
    button.dataset.zip = location.zip || '';
    button.dataset.lat = location._geoloc.lat;
    button.dataset.lon = location._geoloc.lng;
    button.setAttribute('role', 'option');
    button.textContent = `${location.name}, ${location.state}${location.zip ? ` ${location.zip}` : ''}`;
    fragment.appendChild(button);
  });

  resultsContainer.appendChild(fragment);
  resultsContainer.classList.add('active');
  searchBox.setAttribute('aria-expanded', 'true');
}

function clearResults() {
  resultsContainer.innerHTML = '';
  resultsContainer.classList.remove('active');
  searchBox.setAttribute('aria-expanded', 'false');
}

// Fetch OpenWeather Data when a location is selected
async function fetchWeather(location) {
  const { name, state, zip, lat: latValue, lon: lonValue } = location;
  lat = latValue;
  lon = lonValue;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latValue}&lon=${lonValue}&appid=${openWeatherApiKey}&units=imperial`;
  const displayName = `${name}, ${state}${zip ? ` ${zip}` : ''}`;
  searchBox.value = displayName;
  clearResults();

  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();

    city.textContent = displayName;
    currentTemp.innerHTML = `${Math.round(data.main.temp)}°<span style="font-size: 0.5em; vertical-align: super;">F</span>, ${data.weather[0].description}`;

    // Cache the response with display name for offline fallbacks
    localStorage.setItem('lastWeather', JSON.stringify({ ...data, displayName }));

    // Fetch forecast data after updating current weather
    getTenDayForecast();
    getHourlyForecast();
    updateWeatherCards(lat, lon);

  } catch (error) {
    console.error('Weather fetch error:', error);

    const cached = localStorage.getItem('lastWeather');
    if (cached) {
      const data = JSON.parse(cached);
      const cachedName = data.displayName || `${data.name}`;
      city.textContent = cachedName;
      currentTemp.innerHTML = `${Math.round(data.main.temp)}°<span style="font-size: 0.5em; vertical-align: super;">F</span> (cached), ${data.weather[0].description}`;
    } else {
      city.textContent = displayName;
      currentTemp.textContent = 'Unable to fetch weather data. Please check your connection.';
    }
  }
}

// Declare lat in a higher scope
let lat;
let lon;

// Function to make the first API call and get latitude
function getLatitudeAndLongitude() {
  return axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=Deerfield,IL,US&limit=80&appid=${openWeatherApiKey}`)
    .then((response) => {
      const locationData = response.data;
      lat = locationData[0].lat; // Store lat globally
      lon = locationData[0].lon;
      return `${lat} ${lon}`; // Return lat and lon for future use
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
function getCurrentWeather() {
  if (!lat && !lon) {
    console.error('Latitude or Longitude is not available.');
    return;
  }

  // Make the second API call using lat and lon
  axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${openWeatherApiKey}`)
    .then((response) => {
      const weatherData = response.data;

       // Accessing country code
    const countryCode = weatherData.sys.country;


    // Map country codes to state abbreviations (customize this mapping as needed)
    const countryToState = {
        US: {
          AL: 'AL',
          AK: 'AK',
          AZ: 'AZ',
          AR: 'AR',
          CA: 'CA',
          CO: 'CO',
          CT: 'CT',
          DE: 'DE',
          FL: 'FL',
          GA: 'GA',
          HI: 'HI',
          ID: 'ID',
          IL: 'IL',
          IN: 'IN',
          IA: 'IA',
          KS: 'KS',
          KY: 'KY',
          LA: 'LA',
          ME: 'ME',
          MD: 'MD',
          MA: 'MA',
          MI: 'MI',
          MN: 'MN',
          MS: 'MS',
          MO: 'MO',
          MT: 'MT',
          NE: 'NE',
          NV: 'NV',
          NH: 'NH',
          NJ: 'NJ',
          NM: 'NM',
          NY: 'NY',
          NC: 'NC',
          ND: 'ND',
          OH: 'OH',
          OK: 'OK',
          OR: 'OR',
          PA: 'PA',
          RI: 'RI',
          SC: 'SC',
          SD: 'SD',
          TN: 'TN',
          TX: 'TX',
          UT: 'UT',
          VT: 'VT',
          VA: 'VA',
          WA: 'WA',
          WV: 'WV',
          WI: 'WI',
          WY: 'WY',
          // Add more states as needed
        },
        // Add more countries if required
      };
      

    // Get the state abbreviation based on the country code. "IL" is hard coded and will eventually need to be a val captured by user input.
    const state = countryToState[countryCode].IL || 'N/A'; // Default to 'N/A' if not found

      
      console.log('Weather Data:', weatherData);
      

       // Convert temperature from Celsius to Fahrenheit
       const temperatureCelsius = weatherData.main.temp;
       const temperatureFahrenheit = (temperatureCelsius * 9/5) + 32;
       
    //    console.log('Weather Data:');
    //    console.log('Temperature (°C):', temperatureCelsius);
    //    console.log('Temperature (°F):', temperatureFahrenheit);
       
       city.textContent = `${weatherData.name}, ${state}`;
       currentTemp.innerHTML = `${Math.round(temperatureFahrenheit)}°<span style="font-size: 0.5em; vertical-align: super;">F</span>`

    })
    .catch((error) => {
      console.error('Error fetching weather data:', error);
    });
}

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

// Usage example:
getLatitudeAndLongitude()
  .then(() => {
    getCurrentWeather();
    getTenDayForecast();
    getHourlyForecast();
  })
  .catch((error) => {
    console.error('Error getting latitude:', error);
  });

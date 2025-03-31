const openWeatherApiKey = '90feb339669a5a15ccbb64314564e9dd';
const city = document.querySelector('#city-temp h1');
const currentTemp = document.querySelector('#city-temp h2');

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
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},US&appid=${openWeatherApiKey}&units=imperial`;

  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();

    document.getElementById("city-temp").innerHTML = `
      <h1>${data.name}</h1>
      <h2>${Math.round(data.main.temp)}°<span style="font-size: 0.5em; vertical-align: super;">F</span>, ${data.weather[0].description}</h2>
    `;

    // Cache the response
    localStorage.setItem('lastWeather', JSON.stringify(data));

    resultsContainer.innerHTML = ""; // Clear search results after selection
    searchBox.value = city; // Fill input with selected city
    
    // Fetch forecast data after updating current weather
    getFiveDayForecast();
    getHourlyForecast();
    updateWeatherCards(lat, lon);

  } catch (error) {
    console.error("Weather fetch error:", error);

    const cached = localStorage.getItem('lastWeather');
    if (cached) {
      const data = JSON.parse(cached);
      document.getElementById("city-temp").innerHTML = `
        <h1>${data.name}</h1>
        <h2>${Math.round(data.main.temp)}°<span style="font-size: 0.5em; vertical-align: super;">F</span> (cached), ${data.weather[0].description}</h2>
      `;
    } else {
      document.getElementById("city-temp").innerHTML = `
        <h1>${city}</h1>
        <h2>Unable to fetch weather data. Please check your connection.</h2>
      `;
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

function getFiveDayForecast() {
  if (!lat && !lon) {
    console.error('Latitude or Longitude is not available.');
    return;
  }

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
        const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
        const tempMax = Math.round(day.main.temp_max);
        const tempMin = Math.round(day.main.temp_min);
        const pop = Math.round(day.pop * 100);

        return `
          <div class="forecast-day">
            <div class="day">${weekday}</div>
            <img src="${icon}" alt="${day.weather[0].description}" />
            <div class="temps">${tempMax}° / ${tempMin}°</div>
            <div class="pop">🌧️ ${pop}%</div>
          </div>
        `;
      }).join("");

      document.getElementById("five-day-forecast").innerHTML = forecastHTML;
    })
    .catch((e) => {
      console.error("5-day forecast error!", e);
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
    getFiveDayForecast();
    getHourlyForecast();
  })
  .catch((error) => {
    console.error('Error getting latitude:', error);
  });

const apiKey = '90feb339669a5a15ccbb64314564e9dd';
const city = document.querySelector('#city-temp h1');
const currentTemp = document.querySelector('#city-temp h2');





// Declare lat in a higher scope
let lat;
let lon;

// Function to make the first API call and get latitude
function getLatitudeAndLongitude() {
  return axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=Deerfield,IL,US&limit=80&appid=${apiKey}`)
    .then((response) => {
      const locationData = response.data;
      lat = locationData[0].lat; // Store lat globally
      lon = locationData[0].lon;
      return `${lat} ${lon}`; // Return lat and lon for future use
    });
}

function getFiveDayForcast(){
    if (!lat && !lon) {
        console.error('Latitude or Longitude is not available.');
        return;
      }
    // Make api call to get the 5 day forecast
    axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
    .then((res) => {
        const fiveDayForecastData = res.data;
        console.log('Five day forecast data', fiveDayForecastData)
         // Convert temperature from Celsius to Fahrenheit
         //Try looping over this with map function to get all the celsius' for 40 data points.
       const temperatureCelsius = fiveDayForecastData.list;

       for(temp of temperatureCelsius){
        console.log(temp.main.temp)
       }

       const temperatureFahrenheit = (temperatureCelsius * 9/5) + 32;
       console.log(temperatureFahrenheit)
    }).catch((e) => {
        console.error("ERROR !", e)
    });

   
}




// Function to make the second API call using lat
function getCurrentWeather() {
  if (!lat && !lon) {
    console.error('Latitude or Longitude is not available.');
    return;
  }

  // Make the second API call using lat and lon
  axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
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
       currentTemp.textContent = `${Math.round(temperatureFahrenheit)}°F`

    })
    .catch((error) => {
      console.error('Error fetching weather data:', error);
    });
}

// Usage example:
getLatitudeAndLongitude()
  .then(() => {
    // Now that we have lat and lon, we can call the second function
    getCurrentWeather();
    getFiveDayForcast();
  })
  .catch((error) => {
    console.error('Error getting latitude:', error);
  });

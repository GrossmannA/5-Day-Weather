var apiKey = '8b5197e33de4d2ab503208b076814a9e';
var searchBar = document.querySelector('#search-input');
var searchButton = document.querySelector('#search-button');
var daysForecast = document.querySelector('.days-forecast');
var details = document.querySelector('.details');
var weatherCards = document.querySelector('#weather-cards');
var citiesButtons = document.querySelector('#cities-buttons');

function convertCity(event) {
  event.preventDefault();

  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchBar.value}&appid=${apiKey}`)

    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log(data);
      getWeather(data[0].lat, data[0].lon);
    })
    .catch(error => {
      console.error('Fetch error:', error);
    })
}


function getWeather(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`)
    .then(response => {
      if (!response.ok) {
        console.log(response);
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      createCurrent(data);
      createCards(data);
      createSearchHistoryButtons(data);
    })
    .catch(error => {
      console.error('Fetch error:', error);
    })
}


searchButton.addEventListener('click', convertCity);


function createCurrent(data) {
  details.innerHTML = "";

  var currentWeather = document.createElement('div');
  currentWeather.classList = 'details';
  var currentCityAndDate = `${data.city.name} ( ${data.list[0].dt_txt.split(' ')[0]} )`;
  var current = document.createElement('h2');
  current.textContent = currentCityAndDate;
  currentWeather.appendChild(current);

  var currentIcon = document.createElement('img');
  currentIcon.src = `https://openweathermap.org/img/w/${data.list[0].weather[0].icon}.png`;
  currentWeather.appendChild(currentIcon);

  var kelvinTemperature = data.list[0].main.temp;
  var fahrenheitTemperature = kelvinToFahrenheit(kelvinTemperature);
  var currentTemperature = document.createElement('h6');
  currentTemperature.textContent = `Temperature: ${fahrenheitTemperature.toFixed(2)} °F`;
  currentWeather.appendChild(currentTemperature);

  var windSpeedMS = data.list[0].wind.speed;
  var windSpeedMPH = convertWindSpeed(windSpeedMS);
  var currentWind = document.createElement('h6');
  currentWind.textContent = `Wind Speed: ${windSpeedMPH.toFixed(2)} MPH`;
  currentWeather.appendChild(currentWind);

  var currentHumidity = document.createElement('h6');
  currentHumidity.textContent = `Humidity: ${data.list[0].main.humidity}%`;
  currentWeather.appendChild(currentHumidity);

  details.appendChild(currentWeather);
}

function createCards(data) {
  daysForecast.innerHTML = '';
  weatherCards.innerHTML = '';

  var header = document.createElement('h2');
  header.textContent = '5-Day Forecast';
  daysForecast.appendChild(header);

  var repeatedDates = [];
  var currentlyDisplayedDate = data.list[0].dt_txt.split(' ')[0];

  var filteredData = data.list.filter(item => {
    var date = item.dt_txt.split(' ')[0];

    if (date !== currentlyDisplayedDate && !repeatedDates.includes(date)) {
      repeatedDates.push(date);
      return true;
    }
    return false;
  })

  for (var index = 0; index < filteredData.length; index++) {
    var listItem = document.createElement('li');
    listItem.classList = 'card';
    
    var date = filteredData[index].dt_txt.split(' ')[0];
    var fiveDaysDates = `${date}`;
    var fiveDays = document.createElement('h3');
    fiveDays.textContent = fiveDaysDates;
    listItem.appendChild(fiveDays);

    var icon = document.createElement('img');
    icon.src = `https://openweathermap.org/img/w/${data.list[index].weather[0].icon}.png`;
    listItem.appendChild(icon);

    var kelvinTemperature = data.list[index].main.temp;
    var fahrenheitTemperature = kelvinToFahrenheit(kelvinTemperature);
    var temperature = document.createElement('h6');
    temperature.textContent = `Temperature: ${fahrenheitTemperature.toFixed(2)} °F`;
    listItem.appendChild(temperature);

    var windSpeedMS = data.list[index].wind.speed;
    var windSpeedMPH = convertWindSpeed(windSpeedMS);
    var wind = document.createElement('h6');
    wind.textContent = `Wind Speed: ${windSpeedMPH.toFixed(2)} MPH`;
    listItem.appendChild(wind);

    var humidity = document.createElement('h6');
    humidity.textContent = `Humidity: ${data.list[index].main.humidity}%`;
    listItem.appendChild(humidity);

    weatherCards.appendChild(listItem)
  }
}

function kelvinToFahrenheit(kelvin) {
  return (kelvin - 273.15) * (9 / 5) + 32;
}

function convertWindSpeed(windSpeedMS) {
  return windSpeedMS * 2.23694;
}

function createSeparator() {
  var separator = document.createElement('hr');
  return separator;
}

function createSearchHistoryButtons(data) {
  var city = `${data.city.name}`;
  var searchHistoryButtons = document.createElement('button');
  searchHistoryButtons.textContent = city;

  var existingButton = Array.from(citiesButtons.children).find(button => button.textContent === city);

  if (existingButton) {
    return;
  }

  var separator = createSeparator();

  citiesButtons.appendChild(separator);
  citiesButtons.appendChild(searchHistoryButtons);

  searchHistoryButtons.addEventListener('click', function (event) {
    event.preventDefault();
    var storedDataJSON = localStorage.getItem(city);
    var storedData = JSON.parse(storedDataJSON);

    if (storedData) {
      createCurrent(data);
      createCards(data);
    }
  })

  var storedObject = {
    city,
    data
  }

  var storedObjectJSON = JSON.stringify(storedObject);
  localStorage.setItem(city, storedObjectJSON);
}

function loadSearchHistory() {
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    var storedDataJSON = localStorage.getItem(key);
    var storedData = JSON.parse(storedDataJSON);

    if (storedData) {
      createSearchHistoryButtons(storedData.data);
    }
  }
}

window.addEventListener('load', loadSearchHistory);
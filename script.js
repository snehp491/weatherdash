const openCityApiUrl = 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities';
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/onecall';

const cities = {};

let existingCities;

// Prepare the website from recent history
if (localStorage.getItem('recentCities')) {
    existingCities = JSON.parse(localStorage.getItem('recentCities'));

    const resultsSection = document.getElementById('results');
    for (i = 0; i < existingCities.length; i++) {
        cities[existingCities[i]['id']] = existingCities[i];
        const row = document.createElement('div');
        row.className = 'd-flex flex-row';

        const item = document.createElement('div');
        item.className = 'flex-fill';

        const resultButton = document.createElement('button');
        resultButton.className = 'btn btn-secondary full-width mt-2';
        resultButton.textContent = existingCities[i]['city'] + ', ' + existingCities[i]['region'];
        resultButton.id = existingCities[i]['id'];
        resultButton.addEventListener('click', loadDetail);

        item.append(resultButton);
        row.append(item);
        resultsSection.append(row);
    }

} else {
    existingCities = new Array();
}

// Add a new city to the list of recent cities
function addItem(id, city, region, latitude, longitude) {
    console.log('add cities');

    if (existingCities.filter(items => items['id'] === id).length === 0) {
        existingCities.push({ id: id, city: city, region: region, latitude: latitude, longitude: longitude });
        localStorage.setItem('recentCities', JSON.stringify(existingCities));
    }
}

// Load a specific city details and save it in recent cities
function loadDetail($event) {
    const cityId = $event.target.id;
    const city = cities[cityId];

    addItem(cityId, city['city'], city['region'], city['latitude'], city['longitude']);

    fetch(weatherApiUrl + '?' + new URLSearchParams(
        {
            lat: city['latitude'],
            lon: city['longitude'],
            appid: 'bb27746b5bbd19d86e3bfe7bbe6458db',
            units: 'imperial'
        })
    ).then(
        (results) => {
            return results.json();
        }
    ).then((results) => {
        console.log(results);

        const todaysDate = new Date();
        const cityName = document.getElementById('cityName');
        cityName.textContent = city['city'] + '(' + (todaysDate.getMonth() + 1) + '/' + todaysDate.getDate() + '/' + todaysDate.getFullYear() + ')';

        const currentTemp = document.getElementById('currentTemp');
        currentTemp.textContent = results['current']['temp'] + ' degrees';

        const currentWind = document.getElementById('currentWind');
        currentWind.textContent = results['current']['wind_speed'] + ' mph';

        const currentHumidity = document.getElementById('currentHumidity');
        currentHumidity.textContent = results['current']['humidity'] + '%';

        const currentUvIndex = document.getElementById('currentUvIndex');
        currentUvIndex.textContent = results['current']['uvi'];

        const forecast = document.getElementById('fiveDayForecast');
        forecast.innerHTML = '';

        for (i = 1; i < 6; i++) {
           
            const day = results['daily'][i];
            const col = document.createElement('div');
            col.className = 'col-lg';

            const card = document.createElement('div');
            card.className = 'card';

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body weather-card';

            const dateRow = document.createElement('div');
            dateRow.className = 'd-flex flex-row';

            const date = new Date();
            date.setSeconds(day['dt']);

            const dateObject = new Date(day['dt'] * 1000);

            const dateItem = document.createElement('h6');
            dateItem.className = 'text-white';
            dateItem.textContent = dateObject.getMonth() + 1 + '/' + dateObject.getDate() + '/' + dateObject.getFullYear();

            dateRow.append(dateItem);

            const tempRow = document.createElement('div');
            tempRow.className = 'd-flex flex-row';

            const tempElement = document.createElement('div');

            const tempLabel = document.createElement('label');
            tempLabel.textContent = 'Temp:';

            const tempItem = document.createElement('p');
            tempItem.className = 'text-white';
            tempItem.textContent = day['temp']['min'] + ' - ' + day['temp']['max'];

            tempElement.append(tempLabel);
            tempElement.append(tempItem);
            tempRow.append(tempElement);

            const windRow = document.createElement('div');
            windRow.className = 'd-flex flex-row';

            const windElement = document.createElement('div');

            const windLabel = document.createElement('label');
            windLabel.textContent = 'Wind:';

            const windItem = document.createElement('p');
            windItem.className = 'text-white';
            windItem.textContent = day['wind_speed'] + ' mph';

            windElement.append(windLabel);
            windElement.append(windItem);
            windRow.append(windElement);

            const humidityRow = document.createElement('div');
            humidityRow.className = 'd-flex flex-row';

            const humidityElement = document.createElement('div');

            const humidityLabel = document.createElement('label');
            humidityLabel.textContent = 'Humidity:';

            const humidityItem = document.createElement('h6');
            humidityItem.className = 'text-white';
            humidityItem.textContent = day['humidity'] + '%';

            humidityElement.append(humidityLabel);
            humidityElement.append(humidityItem);
            humidityRow.append(humidityElement);

            const uvRow = document.createElement('div');
            uvRow.className = 'd-flex flex-row';

            const uvElement = document.createElement('div');

            const uvLabel = document.createElement('label');
            uvLabel.textContent = 'UVI:';

            const uvItem = document.createElement('h6');
            uvItem.className = 'text-white';
            uvItem.textContent = day['uvi'];

            uvElement.append(uvLabel);
            uvElement.append(uvItem);

            uvRow.append(uvElement);

            cardBody.append(dateRow);
            cardBody.append(tempRow);
            cardBody.append(windRow);
            cardBody.append(humidityRow);
            cardBody.append(uvRow);
            card.append(cardBody);
            col.append(card);
            forecast.append(col);
        }
    }).then(() => {

        const currentConditionsSection = document.getElementById('current-conditions-section');
        currentConditionsSection.style = {
            display: 'inline-block'
        };
        const forecastSection = document.getElementById('forecast-section');
        forecastSection.style = {
            display: 'inline-block'
        };
    });
}

// Search for cities via API
function searchCities() {
    const searchInput = document.getElementById('cityInput');
    const query = searchInput.value;

    if (!query) {
        setup();
        return;
    }

    fetch(openCityApiUrl + '?' + new URLSearchParams({ limit: 10, namePrefix: query, types: 'CITY', countryIds: 'US' }), {
        method: 'GET',
        headers: {
            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
            'X-RapidAPI-Key': '417b42f7dbmsh33c4d4e4b7a2c27p1e2508jsn2a9eb161c839'
        }
    }).then(
        (results) => {
            return results.json();
        }
    ).then((results) => {
        console.log(results);

        const resultsSection = document.getElementById('results');
        resultsSection.innerHTML = '';
        for (i = 0; i < results['data'].length; i++) {

            cities[results['data'][i]['id']] =
            {
                id: results['data'][i]['id'],
                city: results['data'][i]['city'],
                region: results['data'][i]['regionCode'],
                latitude: results['data'][i]['latitude'],
                longitude: results['data'][i]['longitude']
            };
            const row = document.createElement('div');
            row.className = 'd-flex flex-row';

            const item = document.createElement('div');
            item.className = 'flex-fill';

            const resultButton = document.createElement('button');
            resultButton.className = 'btn btn-secondary full-width mt-2';
            resultButton.textContent = results['data'][i].city + ', ' + results['data'][i].regionCode;
            resultButton.id = results['data'][i]['id'];
            resultButton.addEventListener('click', loadDetail);
            item.append(resultButton);
            row.append(item);
            resultsSection.append(row);
        }
    });
}


const searchButton = document.getElementById('searchBtn');
searchButton.addEventListener('click', searchCities);

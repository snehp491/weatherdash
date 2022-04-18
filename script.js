const openCityApiUrl = 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities';

const cities = {};

let existingCities;

// Prepare the website from recent history
if (localStorage.getItem('recentCities')) {
    existingCities = JSON.parse(localStorage.getItem('recentCities'));
    console.log(existingCities);
} else {
    existingCities = new Array();
}

// Add a new city to the list of recent cities
function addItem(id, city, region, latitude, longitude) {
    console.log('add cities');
    existingCities.push({id: id, city: city, region: region, latitude: latitude, longitude: longitude});
    localStorage.setItem('recentCities', JSON.stringify(existingCities));
}

// Load a specific city details and save it in recent cities
function loadDetail($event) {
    const cityId = $event.target.id;
    const city = cities[cityId];

    addItem(cityId, city['city'], city['region'], city['latitude'], city['longitude']);
}

// Search for cities via API
function searchCities() {
    const searchInput = document.getElementById('cityInput');
    const query = searchInput.value;
  
    if (!query) {
      setup();
      return;
    }
  
    fetch(openCityApiUrl + '?' + new URLSearchParams({limit: 10, namePrefix: query, types: 'CITY', countryIds: 'US'}), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
        'X-RapidAPI-Key': '9c7eb9a856mshbbaac42b7e0462cp141808jsna624ee714591'
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
const ctx = document.getElementById('myChart');
const continents = document.querySelector('#continents');
const btns = document.querySelector('#btns');
const loader = document.querySelector('.loader');
let firstChart = true;
const tmpChart = {};

const getData = async (url) => {
  try {
    const res = await fetch(url);
    if(!res.ok) {
      throw Error('error fetching GET');
    }
    const data = res.json();
    return data;
  }
  catch(err) {
    console.log(err);
  }
};

const postData = async (url, method) => {
  try {
    const res = await fetch(url, method);
    const data = await res.json();
    return data;
  }
  catch(err) {
    console.log(err);
  }
};

const createBtn = (text) => {
  const btn = document.createElement('button');
  btn.textContent = text;
  btns.appendChild(btn);
};

const clearBtns = () => {
  let child = btns.firstElementChild;
  while(child != null) {
    const tmp = child.nextElementSibling;
    child.remove();
    child = tmp;
  }
};

const getCountriesPopulations = countries => {
  const populationPromises = [];
  countries.forEach(country => {
    const method = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        country: country.name.common
      })
    }
    populationPromises.push(postData('https://countriesnow.space/api/v0.1/countries/population', method));
  });
  return populationPromises;
};

const getCitiesPopulations = cities => {
  const populationPromises = [];
  cities.forEach(city => {
    const method = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        city: city
      })
    }
    populationPromises.push(postData('https://countriesnow.space/api/v0.1/countries/population/cities', method));
  });
  return populationPromises;
};

const addChartDataCountries = (countries, population) => {
  const obj = {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
          {
            label: 'Population',
            data: [],
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1
          },
        ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    },
  };

  clearBtns();
  
  countries.forEach((country, index) => {
    let length = -1;
    if(population[index].data !== undefined) {
      length = population[index].data.populationCounts.length - 1;
    }
    if(length !== -1) {
      obj.data.labels.push(country.name.common);
      createBtn(country.name.common);
      obj.data.datasets[0].data.push(population[index].data.populationCounts[length].value);
    }
  });
  return obj;
};

const addChartDataCities = (cities, population) => {
  const obj = {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
          {
            label: 'Population',
            data: [],
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1
          },
        ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    },
  };

  clearBtns();
  
  cities.forEach((city, index) => {
    let length = -1;
    if(population[index] !== undefined && population[index].data !== undefined) {
      length = population[index].data.populationCounts.length - 1;
    }
    if(length !== -1) {
      obj.data.labels.push(city);
      createBtn(city);
      obj.data.datasets[0].data.push(population[index].data.populationCounts[length].value);
    }
  });
  return obj;
};

const updateChart = chartData => {
  if(firstChart) {
    const myChart = new Chart(ctx, chartData);
    tmpChart.chart = myChart;
    firstChart = false;
  }
  else {
    tmpChart.chart.destroy();
    const myChart = new Chart(ctx, chartData);
    tmpChart.chart = myChart;
  }
};

const fillChartCountries = async (continent) => {
  loader.classList.remove('hidden');
  const countries = await getData(continent);
  const populationPromises = getCountriesPopulations(countries);
  const population = await Promise.all(populationPromises);
  const chartData = addChartDataCountries(countries, population);
  updateChart(chartData);
  loader.classList.add('hidden');
};

const fillChartCities = async (url, country) => {
  loader.classList.remove('hidden');
  const cities = await postData(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      country: country
    })
  });
  const populationPromises = getCitiesPopulations(cities.data);
  const population = await Promise.all(populationPromises);
  console.log(population);

  const chartData = addChartDataCities(cities.data, population);
  updateChart(chartData);
  loader.classList.add('hidden');
};

continents.addEventListener('click', (e) => {
  const target = e.target;
  if(target.id === 'continents') {
    return;
  }
  fillChartCountries('https://restcountries.com/v3.1/region/'  + target.textContent.toLowerCase());
},
{
  capture: true
});

btns.addEventListener('click', (e) => {
  const target = e.target;
  if(target.id === 'btns') {
    return;
  }
  fillChartCities('https://countriesnow.space/api/v0.1/countries/cities', target.textContent.toLowerCase());
},
{
  capture: true
});
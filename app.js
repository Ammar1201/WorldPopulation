const ctx = document.getElementById('myChart');
const continents = document.querySelector('#continents');
const btns = document.querySelector('#btns');
const loading = document.querySelector('.loader');
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

const checkStorage = (key) => {
  const item = window.localStorage.getItem(key);
  if(item !== null) {
    return item;
  }
  return null;
}

const filterData = data => {
  if(data !== undefined) {
    const filteredData = data.filter(value => {
      if(value !== undefined || value.error === true || value.data !== undefined) {
        return value;
      }
    });
    return filteredData;
  }
  return null;
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

const disableBtns = element => {
  let child = element.firstElementChild;
  while(child != null) {
    child.setAttribute('disabled', '');
    child = child.nextElementSibling;
  }
};

const enableBtns = element => {
  let child = element.firstElementChild;
  while(child != null) {
    child.removeAttribute('disabled');
    child = child.nextElementSibling;
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
    if(population[index] !== null && population[index] !== undefined && population[index].data !== undefined) {
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

// const updateChart = chartData => {
//   if(firstChart) {
//     const myChart = new Chart(ctx, chartData);
//     tmpChart.chart = myChart;
//     firstChart = false;
//   }
//   else {
//     tmpChart.chart.destroy();
//     const myChart = new Chart(ctx, chartData);
//     tmpChart.chart = myChart;
//   }
// };

const fillChartCountries = async (url, continent) => {
  disableBtns(continents);
  disableBtns(btns);
  if(tmpChart.chart !== undefined) {
    tmpChart.chart.destroy();
  }
  loading.classList.remove('hidden');
  const item = checkStorage(continent);
  if(item === null) {
    const countries = await getData(url + continent);
    const populationPromises = getCountriesPopulations(countries);
    const populationTMP = await Promise.all(populationPromises);
    const population = filterData(populationTMP);
    const chartData = addChartDataCountries(countries, population);
    tmpChart.chart = new Chart(ctx, chartData);
    // updateChart(chartData);
    window.localStorage.setItem(continent, JSON.stringify(countries));
    window.localStorage.setItem(`${continent} countries population`, JSON.stringify(population));
  }
  else {
    const countries = JSON.parse(window.localStorage.getItem(continent));
    const population = JSON.parse(window.localStorage.getItem(`${continent} countries population`));
    const chartData = addChartDataCountries(countries, population);
    tmpChart.chart = new Chart(ctx, chartData);
    // updateChart(chartData);
  }
  loading.classList.add('hidden');
  enableBtns(continents);
  enableBtns(btns);
};

const fillChartCities = async (url, country) => {
  disableBtns(continents);
  disableBtns(btns);
  if(tmpChart.chart !== undefined) {
    tmpChart.chart.destroy();
  }
  loading.classList.remove('hidden');
  const item = checkStorage(country);
  if(item === null) {
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
    // const population = filterData(populationTMP);
    const chartData = addChartDataCities(cities.data, population);
    tmpChart.chart = new Chart(ctx, chartData);
    // updateChart(chartData);
    window.localStorage.setItem(country, JSON.stringify(cities));
    window.localStorage.setItem(`${country} cities population`, JSON.stringify(population));
  }
  else {
    const cities = JSON.parse(window.localStorage.getItem(country));
    const population = JSON.parse(window.localStorage.getItem(`${country} cities population`));
    const chartData = addChartDataCities(cities.data, population);
    tmpChart.chart = new Chart(ctx, chartData);
    // updateChart(chartData);
  }
  loading.classList.add('hidden');
  enableBtns(continents);
  enableBtns(btns);
};

continents.addEventListener('click', (e) => {
  const target = e.target;
  if(target.id === 'continents') {
    return;
  }
  fillChartCountries('https://restcountries.com/v3.1/region/', target.textContent.toLowerCase());
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
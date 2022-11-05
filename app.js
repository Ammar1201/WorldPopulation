const ctx = document.getElementById('myChart');
const continents = document.querySelector('#continents');
const btns = document.querySelector('#btns');
const loading = document.querySelector('.loader');
const msg = document.querySelector('#msg');
const tmpChart = {};
const chartData = {
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
        ticks: { color: 'white', beginAtZero: true }
      },
      x: {
        ticks: { color: 'white', beginAtZero: true }
      }
    }
  },
};

//* ----------------------------fetching data Functions--------------------------------------------
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

//* ----------------------------Utility Functions--------------------------------------------
const createBtn = (text) => {
  const btn = document.createElement('button');
  btn.textContent = text;
  btns.appendChild(btn);
};

const deleteBtns = () => {
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

const disableDeleteAndShow = () => {
  disableBtns(continents);
  if(tmpChart.chart !== undefined) {
    deleteBtns();
    tmpChart.chart.destroy();
  }
  loading.classList.remove('hidden');
};

const handleError = () => {
  disableDeleteAndShow();
  msg.textContent = 'Country data not found! Please choose again!';
  msg.classList.remove('hidden');
  loading.classList.add('hidden');
  enableBtns(continents);
};

//* ----------------------------get Functions--------------------------------------------
const getMethod = (key, value) => {
  const method = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      [key]: value
    })
  };
  return method;
};

const getCountriesPopulations = countries => {
  const populationPromises = [];
  countries.forEach(country => {
    const method = getMethod('country', country.name.common);
    populationPromises.push(postData('https://countriesnow.space/api/v0.1/countries/population', method));
  });
  return populationPromises;
};

const getCitiesPopulations = cities => {
  const populationPromises = [];
  cities.forEach(city => {
    const method = getMethod('city', city);
    populationPromises.push(postData('https://countriesnow.space/api/v0.1/countries/population/cities', method));
  });
  return populationPromises;
};

//* ----------------------------adding chart data Functions--------------------------------------------
const addChartDataCountries = (countries, population) => {
  chartData.data.labels = [];
  chartData.data.datasets[0].data = [];
  countries.forEach((country, index) => {
    let length = -1;
    if(population[index].data !== undefined) {
      length = population[index].data.populationCounts.length - 1;
    }
    if(length !== -1) {
      chartData.data.labels.push(country.name.common);
      createBtn(country.name.common);
      chartData.data.datasets[0].data.push(population[index].data.populationCounts[length].value);
    }
  });
};

const addChartDataCities = (cities, population) => {
  chartData.data.labels = [];
  chartData.data.datasets[0].data = [];
  cities.forEach((city, index) => {
    let length = -1;
    if(population[index] !== null && population[index] !== undefined && population[index].data !== undefined) {
      length = population[index].data.populationCounts.length - 1;
    }
    if(length !== -1) {
      chartData.data.labels.push(city);
      createBtn(city);
      chartData.data.datasets[0].data.push(population[index].data.populationCounts[length].value);
    }
  });
};

//* ----------------------------filling chart Functions--------------------------------------------
const fillChartCountries = async (url, continent) => {
  msg.classList.add('hidden');
  disableDeleteAndShow();
  const item = window.localStorage.getItem(continent);
  if(item === null) {
    const countries = await getData(url + continent);
    const populationPromises = getCountriesPopulations(countries);
    const population = await Promise.all(populationPromises);
    addChartDataCountries(countries, population);
    tmpChart.chart = new Chart(ctx, chartData);
    window.localStorage.setItem(continent, JSON.stringify(countries));
    window.localStorage.setItem(`${continent} countries population`, JSON.stringify(population));
  }
  else {
    const countries = JSON.parse(window.localStorage.getItem(continent));
    const population = JSON.parse(window.localStorage.getItem(`${continent} countries population`));
    addChartDataCountries(countries, population);
    tmpChart.chart = new Chart(ctx, chartData);
  }
  loading.classList.add('hidden');
  enableBtns(continents);
};

const fillChartCities = async (url, country) => {
  msg.classList.add('hidden');
  disableDeleteAndShow();
  const item = window.localStorage.getItem(country);
  if(item === null) {
    const cities = await postData(url, getMethod('country', country));
    if(cities.error) {
      handleError();
      return;
    }
    const populationPromises = getCitiesPopulations(cities.data);
    const population = await Promise.all(populationPromises);
    addChartDataCities(cities.data, population);
    tmpChart.chart = new Chart(ctx, chartData);
    window.localStorage.setItem(country, JSON.stringify(cities));
    window.localStorage.setItem(`${country} cities population`, JSON.stringify(population));
  }
  else {
    const cities = JSON.parse(window.localStorage.getItem(country));
    const population = JSON.parse(window.localStorage.getItem(`${country} cities population`));
    addChartDataCities(cities.data, population);
    tmpChart.chart = new Chart(ctx, chartData);
  }
  loading.classList.add('hidden');
  enableBtns(continents);
};

//* ----------------------------Events--------------------------------------------
const startEvents = () => {
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
};

//* ----------------------------Main Function--------------------------------------------
const main = () => {
  startEvents();
};

main();
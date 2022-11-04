const ctx = document.getElementById('myChart');
const continents = document.querySelector('#continents');
const btns = document.querySelector('#btns');
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

const addChartData = (countries, population) => {
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
  const countries = await getData(continent);
  const populationPromises = getCountriesPopulations(countries);
  const population = await Promise.all(populationPromises);

  const chartData = addChartData(countries, population);
  updateChart(chartData);
};

continents.addEventListener('click', (e) => {
  const target = e.target;
  if(target.textContent.length > 7) {
    return;
  }
  fillChartCountries('https://restcountries.com/v3.1/region/'  + target.textContent.toLowerCase());
},
{
  capture: true
});
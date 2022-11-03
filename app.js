const ctx = document.getElementById('myChart');
const continents = document.querySelector('#continents');
let firstChart = true;
const tmp = {};

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

const fillChart = async (continent) => {
  const countries = await getData('https://restcountries.com/v3.1/region/' + continent);
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
  const population = await Promise.all(populationPromises);
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
  
  countries.forEach((country, index) => {
    let length = -1;
    if(population[index].data !== undefined) {
      length = population[index].data.populationCounts.length - 1;
    }
    if(length !== -1) {
      obj.data.labels.push(country.name.common);
      obj.data.datasets[0].data.push(population[index].data.populationCounts[length].value);
    }
  });

  if(firstChart) {
    const myChart = new Chart(ctx, obj);
    tmp.chart = myChart;
    firstChart = false;
  }
  else {
    tmp.chart.destroy();
    const myChart = new Chart(ctx, obj);
    tmp.chart = myChart;
  }
};

continents.addEventListener('click', (e) => {
  const target = e.target;
  if(target.textContent.length > 7) {
    return;
  }
  fillChart(target.textContent.toLowerCase());
},
{
  capture: true
});
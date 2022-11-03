
const ctx = document.getElementById('myChart');
// const myChart = new Chart(ctx, {
//   type: 'bar',
//   data: {
//       labels: ['Austria', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange','Austria', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
//       datasets: [
//         {
//           label: 'Population',
//           data: [12, 19, 3, 5, 2, 3,12, 19, 3, 5, 2, 3],
//           backgroundColor: [
//             'rgba(255, 99, 132, 0.8)',
//           ],
//           borderColor: [
//             'rgba(255, 99, 132, 1)',
//           ],
//           borderWidth: 1
//         },
//         {
//           label: 'Number',
//           data: [10, 15, 13, 15, 12, 13, 10, 20, 3, 5, 2, 3],
//           backgroundColor: [
//             'rgba(255, 0, 132, 0.8)',
//           ],
//           borderColor: [
//             'rgba(255, 0, 132, 1)',
//           ],
//           borderWidth: 1
//         },
//       ],
//   },
//   options: {
//     scales: {
//       y: {
//         beginAtZero: true
//       }
//     }
//   },
// });

const fetchData = async (url) => {
  try {
    const res = await axios.get(url);
    return res.data;
  }
  catch(err) {
    console.log(err);
  }
};

const POSTData = async (url, method) => {
  // try {
  //   const res = await axios.post(url, method);
  //   return res.data;
  // }
  // catch(err) {
  //   console.log(err);
  // }
  try {
    const res = await fetch(url, method);
    const data = await res.json();
    return data;
  }
  catch(err) {
    console.log(err);
  }
};

const fillChart = async () => {
  // const method = {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     country: 'france'
  //   })
  // }

  // const method = { country: 'france' };

  const countries = await fetchData('https://restcountries.com/v3.1/region/asia');
  const populationPromises = [];
  countries.forEach(country => {
    // const method = { country: country.name.common };
    const method = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        country: country.name.common
      })
    }
    populationPromises.push(POSTData('https://countriesnow.space/api/v0.1/countries/population', method));
  });
  console.log(populationPromises);
  const population = await Promise.all(populationPromises);
  console.log(population);

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

  const myChart = new Chart(ctx, obj);
};

fillChart();
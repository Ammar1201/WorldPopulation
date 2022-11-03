
const ctx = document.getElementById('myChart');
const myChart = new Chart(ctx, {
  type: 'bar',
  data: {
      labels: ['Austria', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange','Austria', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [
        {
          label: 'Population',
          data: [12, 19, 3, 5, 2, 3,12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1
        },
        {
          label: 'Number',
          data: [10, 15, 13, 15, 12, 13, 10, 20, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 0, 132, 0.8)',
          ],
          borderColor: [
            'rgba(255, 0, 132, 1)',
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
});
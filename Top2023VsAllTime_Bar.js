// Load the CSV data using PapaParse
function loadData(url, callback) {
  Papa.parse(url, {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function (results) {
      callback(results.data);
    },
  });
}

// Load data for this year
loadData('top_movies_2023.csv', function (thisYearData) {
  // Load data for all time
  loadData('goat_movies.csv', function (allTimeData) {
    // Get the top 20 movies for this year
    var thisYearTop20 = thisYearData.slice(0, 20);

    // Get the top 20 movies of all time
    var allTimeTop20 = allTimeData.slice(0, 20);

    // Extract x and y data for Plotly
    var thisYearX = thisYearTop20.map((movie) => movie.Rank);
    var thisYearY = thisYearTop20.map((movie) => movie['Gross Earnings']);
    var allTimeX = allTimeTop20.map((movie) => movie.Rank);
    var allTimeY = allTimeTop20.map((movie) => movie['Lifetime Gross']);

    // Create a gradient of shades from light purple to dark purple
    var colorScale = chroma.scale(['#D1D0EA', '#6A5ACD']).colors(2);

    // Create the Plotly figure
    var layout = {
      title: 'Top 20 Movies of All Time vs. Top 20 Movies in 2023',
        titlefont: {
          size: 20, // Adjust the font size as needed
          family: 'Verdana', // Change the font family here
        },
      xaxis: {
        title: 'Ranking',
        dtick: 1, // Set the tick step to 1
      },
      yaxis: {
        title: 'Gross Earnings',
        tickvals: [0, 200000000, 400000000, 600000000, 800000000, 1000000000, 1200000000, 1400000000, 1600000000], // Set specific tick values
        ticktext: ['$0', '$200M', '$400M', '$600M', '$800M', '$1B', '$1.2B', '$1.4B', '$1.6B'], // Set corresponding tick labels
      },
      barmode: 'stack', // Stacked bars
    };

    var trace1 = {
      x: thisYearX,
      y: thisYearY,
      hovertext: thisYearTop20.map((movie) => `${movie.Title}<br>Gross: $${movie['Gross Earnings'].toLocaleString()}`), // Include movie title in hovertext
      name: 'Top 2023 Movies',
      type: 'bar',
      marker: { color: colorScale[1] },
    };

    var trace2 = {
      x: allTimeX,
      y: allTimeY,
      hovertext: allTimeTop20.map((movie) => `${movie.Title}<br>Lifetime Gross: $${movie['Lifetime Gross'].toLocaleString()}`), // Include movie title in hovertext
      name: 'Top Movies of All Time',
      type: 'bar',
      marker: { color: colorScale[0] },
    };

    var data = [trace1, trace2];

    Plotly.newPlot('myBar', data, layout);
  });
});







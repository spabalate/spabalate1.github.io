// Function to parse CSV string into an array of objects
function parseCSV(csvString) {
  const rows = csvString.split('\n');
  const headers = rows[0].split(',');
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i].split(',');
    const entry = {};

    for (let j = 0; j < headers.length; j++) {
      entry[headers[j]] = values[j];
    }

    data.push(entry);
  }

  return data;
}

// Read the CSV file
fetch('top_movies_2023.csv')
  .then(response => response.text())
  .then(csvString => {
    const csvData = parseCSV(csvString);

    // Create an array to store individual traces
    const traces = [];

    // Get values for color gradient
    const colors = csvData.map(entry => parseFloat(entry['Gross Earnings']));

    // Generate a gradient of shades from light purple to dark purple
    const colorScale = chroma.scale(['#D1D0EA', '#6A5ACD']).colors(colors.length);

    // Loop through the data to create traces for each movie
    csvData.forEach((entry, index) => {
      const xValue = parseFloat(entry['Number of Theaters']);
      const yValue = parseFloat(entry['Gross Earnings']);
      const size = Math.sqrt(yValue) * 0.005;

      const formattedGrossEarnings = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0, // Omit decimal places if they are .00
        maximumFractionDigits: 2, // Allow up to 2 decimal places
      }).format(yValue);

      const trace = {
        x: [xValue],
        y: [yValue],
        mode: 'markers',
        type: 'scatter',
        text: [`${entry.Title}<br>Gross Earnings: ${formattedGrossEarnings.replace('.00', '')}<br>Number of Theaters: ${entry['Number of Theaters']}`],
        marker: {
          size: size,
          color: colorScale[index], // Use the color from the chroma gradient
          line: {
            color: 'black', // Border color
            width: 1,       // Border width
          },
        },
        name: entry.Title, // Set the name for the legend
        legendgroup: entry.Title, // Use a unique value for legendgroup
      };

      traces.push(trace);
    });

    const layout = {
      xaxis: {
        title: 'Number of Theaters',
        type: 'linear',
        range: [0, 5000],
      },
      yaxis: {
        title: {
          text: 'Gross Earnings',
          standoff: 15, // Adjust the standoff to move the title away from the ticks
        },
        type: 'linear',
        tickmode: 'array',
        tickvals: [-25000000, 0, 100000000, 200000000, 300000000, 400000000, 500000000, 600000000, 700000000, 800000000, 900000000],
        tickformat: '$,s',
        ticktext: [
          '', '$0', '$100M', '$200M', '$300M', '$400M', '$500M', '$600M', '$700M', '$800M', '$900M'
        ],
        showline: false,         // Show y-axis line
        showticklabels: true,   // Show tick labels
        range: [-25000000, 900000000], // Adjust the range to include negative values
      },
      title: '2023 Gross Earnings vs. Number of Theaters',
        titlefont: {
          size: 20, // Adjust the font size as needed
          family: 'Verdana', // Change the font family here
        },
      legend: {
        x: 1,
        y: 1,
        traceorder: 'normal',
        orientation: 'v',
      },
      margin: {
        l: 80, // Adjust the left margin
        r: 50, // Adjust the right margin
        b: 50, // Adjust the bottom margin
        t: 50, // Adjust the top margin
        pad: 4, // Adjust the padding
      },
    };

    // Create the scatter plot using Plotly
    Plotly.newPlot('myScatter', traces, layout);

    // Add event listener for legend item clicks
    document.getElementById('myScatter').on('legendclick', function (event) {
      const clickedTraceName = event.data[0].name;

      // Toggle visibility for the clicked trace
      const clickedTrace = traces.find(trace => trace.name === clickedTraceName);
      clickedTrace.visible = !clickedTrace.visible;

      // Update the plot with the modified traces
      Plotly.update('myScatter', { visible: traces.map(trace => trace.visible) });
    });
  })
  .catch(error => console.error('Error fetching CSV file:', error));

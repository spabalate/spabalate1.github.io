document.addEventListener('DOMContentLoaded', function () {
    fetch('top_movies_2023.csv')
        .then(response => response.text())
        .then(data => {
            // Parse CSV data
            var movieData = Papa.parse(data, { header: true }).data;

            // Filter top 20 movies
            var top20Movies = movieData.slice(0, 20);

            // Create a copy of the array
            var top20MoviesCopy = top20Movies.map(movie => ({ ...movie }));

            // Replace '-' with 'Miscellaneous' in the 'Distributor' field
            top20MoviesCopy.forEach(movie => {
                if (movie['Distributor'] === '-') {
                    movie['Distributor'] = 'Miscellaneous';
                }
            });

            // Count occurrences of each distributor
            var distributorCounts = {};
            top20MoviesCopy.forEach(movie => {
                var distributor = movie['Distributor'];
                distributorCounts[distributor] = (distributorCounts[distributor] || 0) + 1;
            });

            // Get labels and data for Chart.js and sort them
            var sortedData = Object.entries(distributorCounts)
                .sort((a, b) => b[1] - a[1]);

            var labels = sortedData.map(entry => entry[0]);
            var data = sortedData.map(entry => entry[1]);

            // Generate a gradient of shades from light purple to dark purple
            var colorScale = chroma.scale(['#D1D0EA', '#6A5ACD']); // Light to dark purple

            // Map the color scale to the number of data points
            var backgroundColors = colorScale.colors(data.length);

            // Create a pie chart using Chart.js
            var ctx = document.getElementById('myPie').getContext('2d');
            var distributorChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors,
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Top 20 Movie Distributors for 2023',
                            font: {
                                size: 20,
                                family: 'Verdana', // Change the font family here
                                weight: 'normal',
                            },
                            padding: {
                                bottom: 40, // Add bottom padding to title
                            },
                        },
                        legend: {
                            display: true,
                            position: 'right',
                            align: 'center',
                            labels: {
                                boxWidth: 15,
                                padding: 30,
                                font: {
                                    family: 'Verdana', // Change the font family here
                                    size: 14, // Adjust the font size as needed
                                },
                            },
                        },
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    aspectRatio: 1,
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

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

            // Calculate total gross income for each distributor
            var distributorGrossIncomes = {};
            var totalGross = top20MoviesCopy.reduce((acc, movie) => acc + parseInt(movie['Gross Earnings']), 0);

            top20MoviesCopy.forEach(movie => {
                var distributor = movie['Distributor'];
                var grossIncome = parseInt(movie['Gross Earnings']);
                distributorGrossIncomes[distributor] = (distributorGrossIncomes[distributor] || 0) + grossIncome;
            });

            // Get labels, data, and sizes for Chart.js and sort them
            var sortedData = Object.entries(distributorGrossIncomes)
                .sort((a, b) => b[1] - a[1]);

            var labels = sortedData.map(entry => entry[0]);
            var data = sortedData.map(entry => entry[1]);
            var sizes = data.map(value => (value / totalGross) * 150);

            // Generate a gradient of shades from light purple to dark purple
            var colorScale = chroma.scale(['#D1D0EA', '#6A5ACD']); // Light to dark purple

            // Map the color scale to the number of data points
            var backgroundColors = colorScale.colors(data.length);

            // Create a bubble graph using Chart.js
            var ctx = document.getElementById('myBubble').getContext('2d');
            var distributorChart = new Chart(ctx, {
                type: 'bubble',
                data: {
                    datasets: [{
                        label: 'Distribution of Movies by Distributor',
                        data: labels.map((label, index) => ({
                            label: label,
                            x: index,
                            y: data[index],
                            r: sizes[index]
                        })),
                        backgroundColor: backgroundColors,
                        borderWidth: 1,
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
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    var labels = context.chart.data.labels;
                                    var label = labels[context.dataIndex] || '';
                                    var value = context.parsed.y;
                                    var percentage = sizes[context.dataIndex].toFixed(1) + '%';
                                    return `${label}: $${value.toLocaleString()} | ${percentage}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'category',
                            labels: labels,
                            title: {
                                display: true,
                                text: 'Distributor'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Gross Earnings'
                            },
                            ticks: {
                                callback: function (value, index, values) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    aspectRatio: 1,
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

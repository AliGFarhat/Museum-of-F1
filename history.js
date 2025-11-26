// c:\Users\Ali\Desktop\Assessments\Year 3\Tomorrow's Web\Assessment 1\Museum-of-F1\history.js

document.addEventListener('DOMContentLoaded', () => {
    // Select the main content area that will hold the page header and the grid.
    const mainContentContainer = document.querySelector('.main-content');

    // If the container doesn't exist, stop the script to avoid errors.
    if (!mainContentContainer) {
        console.error('Main content container (.main-content) not found.');
        return;
    }

    // This is an asynchronous function to fetch session data from the OpenF1 API.
    async function fetchAndDisplaySessions() {
        // Show a loading message while fetching data.
        mainContentContainer.innerHTML = '<p style="color: white; font-size: 1.2rem; padding: 2rem;">Loading race history...</p>';

        try {
            // Fetch data from the sessions endpoint. We can add parameters to filter.
            // For example, let's get all race sessions from 2023.
            // The tutorial examples use .then(), but async/await is a modern and clean way to achieve the same result.
            const response = await fetch('https://api.openf1.org/v1/sessions?session_name=Race&year=2023');

            // Check if the request was successful.
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse the JSON data from the response.
            const sessions = await response.json();

            // Clear the main content area and rebuild its structure.
            mainContentContainer.innerHTML = `
                <header class="page-header">
                    <h1 class="page-title">Formula 1 History</h1>
                    <p class="page-subtitle">Explore races from the history of Formula 1</p>
                </header>
                <div class="grid"></div>
            `;

            // Now, select the newly created grid container.
            const gridContainer = mainContentContainer.querySelector('.grid');

            // If no sessions are found, display a message.
            if (sessions.length === 0) {
                gridContainer.innerHTML = '<p style="color: white;">No sessions found.</p>';
                return;
            }

            // A helper object to map meeting names from the API to your image files.
            // You would expand this list for all your tracks.
            // Note: The API uses 'location' for the track name.
            const trackImages = {
                'Monte Carlo': 'images/tracks/monaco.png',
                'Silverstone': 'images/tracks/silverstone.png',
                'Spa-Francorchamps': 'images/tracks/spa.png',
                'Monza': 'images/tracks/monza.png',
                'Suzuka': 'images/tracks/suzuka.png',
            };

            // Loop through each session returned by the API.
            sessions.forEach(async session => {
                // Create the HTML for a new card.
                const card = document.createElement('article');
                card.className = 'card';

                // Fetch weather data for this specific session
                const weatherResponse = await fetch(`https://api.openf1.org/v1/weather?session_key=${session.session_key}`);
                const weatherData = await weatherResponse.json();

                // Check if there was any rainfall during the session.
                // The 'rainfall' property is a boolean (true/false).
                const hadRain = weatherData.some(dataPoint => dataPoint.rainfall === true);
                const weatherCondition = hadRain ? 'Wet' : 'Dry';

                // Get the correct image path, or a default one if not found.
                const imageUrl = trackImages[session.location] || 'images/tracks/default.png';

                card.innerHTML = `
                    <div class="image-placeholder" style="background-image: url('${imageUrl}');"></div>
                    <div class="card-meta-primary">${session.year} | ${session.location} | ${session.session_type}</div>
                    <div class="card-meta-secondary">${session.country_name} • ${weatherCondition}</div>
                `;

                // Add the newly created card to the grid.
                gridContainer.appendChild(card);
            });

        } catch (error) {
            // If an error occurs, display it on the page.
            mainContentContainer.innerHTML = `<p style="color: red; padding: 2rem;">Failed to load race history: ${error.message}</p>`;
            console.error('Error fetching sessions:', error);
        }
    }

    // Call the function to fetch and display the data when the page loads.
    fetchAndDisplaySessions();
});

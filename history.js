// c:\Users\Ali\Desktop\Assessments\Year 3\Tomorrow's Web\Assessment 1\Museum-of-F1\history.js

document.addEventListener('DOMContentLoaded', () => {
    // Select the main content area that will hold the page header and the grid.
    const mainContentContainer = document.querySelector('.main-content');

    // If the container doesn't exist, stop the script to avoid errors.
    if (!mainContentContainer) {
        console.error('Main content container (.main-content) not found.');
        return;
    }

    // This function handles rendering the page content from the session data.
    async function renderPage(allSessions) {
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
        
        if (!allSessions || allSessions.length === 0) {
            gridContainer.innerHTML = '<p style="color: white;">No sessions found.</p>';
            return;
        }

        // A helper object to map meeting names from the API to your image files.
        const trackImages = {
            'Monaco': 'images/tracks/monaco.png',
            'Silverstone': 'images/tracks/silverstone.png',
            'Spa-Francorchamps': 'images/tracks/spa.png',
            'Monza': 'images/tracks/monza.png',

            'Suzuka': 'images/tracks/suzuka.png',
            'Yas Marina Circuit': 'images/tracks/abudhabi.png',
            'Yas Marina': 'images/tracks/abudhabi.png',
            'Sakhir': 'images/tracks/bahrain.png',
            'Jeddah': 'images/tracks/saudi.png',
            'Melbourne': 'images/tracks/australia.png',
            'Baku': 'images/tracks/baku.png',
            'Miami': 'images/tracks/miami.png',
            'Imola': 'images/tracks/imola.png',

            'Barcelona': 'images/tracks/spain.png',
            'Montréal': 'images/tracks/canada.png',
            'Spielberg': 'images/tracks/austria.png',
            'Budapest': 'images/tracks/hungary.png',
            'Zandvoort': 'images/tracks/dutch.png',
            'Marina Bay': 'images/tracks/singapore.png',
            'Lusail': 'images/tracks/qatar.png',
            'Austin': 'images/tracks/usa.png',
            'Mexico City': 'images/tracks/mexico.png',
            'São Paulo': 'images/tracks/brazil.png',
            'Las Vegas': 'images/tracks/lasvegas.png',
            'Shanghai': 'images/tracks/china.png'
        };

        const flagImages = {
            'UAE': 'images/flags/uae.png',
            'Bahrain': 'images/flags/bhr.png',
            'Saudi Arabia': 'images/flags/sau.png',
            'Australia': 'images/flags/aus.png',
            'Azerbaijan': 'images/flags/aze.png',
            'USA': 'images/flags/usa.png',
            'Italy': 'images/flags/ita.png',
            'Spain': 'images/flags/esp.png',
            'Canada': 'images/flags/can.png',
            'Austria': 'images/flags/aut.png',
            'Hungary': 'images/flags/hun.png',
            'Netherlands': 'images/flags/nld.png',
            'Singapore': 'images/flags/sgp.png',
            'Qatar': 'images/flags/qat.png',
            'Mexico': 'images/flags/mex.png',
            'Brazil': 'images/flags/bra.png',
            'China': 'images/flags/chn.png',
            'Belgium': 'images/flags/bel.png',
            'Japan': 'images/flags/jpn.png',
            'Monaco': 'images/flags/mco.png'
        };

        // Use a for...of loop to process sessions sequentially.
        for (const session of allSessions) {
            // Normalize location names if necessary
            if (session.location === 'Yas Island') {
                session.location = 'Yas Marina';
            }

            // Determine flag image
            let countryKey = session.country_name;
            if (countryKey === 'United States') countryKey = 'USA';
            if (countryKey === 'United Arab Emirates') countryKey = 'UAE';
            
            const countryFlag = flagImages[countryKey];

            // Create the HTML for a new card.
            const card = document.createElement('article');
            card.className = 'card';

            // Fetch weather data for this specific session
            const weatherResponse = await fetch(`https://api.openf1.org/v1/weather?session_key=${session.session_key}`);
            let weatherCondition = 'N/A'; // Default to N/A

            // Check if the response is valid JSON before parsing.
            const contentType = weatherResponse.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const weatherData = await weatherResponse.json();
                
                // If we got valid data, determine if it was wet or dry.
                if (Array.isArray(weatherData)) {
                    const hadRain = weatherData.some(dataPoint => dataPoint.rainfall > 0);
                    weatherCondition = hadRain ? 'Wet' : 'Dry';
                }
            }

            // Get the correct image path, or a default one if not found.
            const imageUrl = trackImages[session.location] || 'images/tracks/default.png';
            
            card.innerHTML = `
                <div class="image-placeholder" style="position: relative; overflow: hidden;">
                    <img src="${imageUrl}" alt="${session.location}" style="width: 100%; height: 100%; object-fit: contain; position: absolute; top: 0; left: 0;">
                     ${countryFlag ? `<img src="${countryFlag}" alt="${session.country_name} Flag" style="width: 30px; position: absolute; bottom: 15px; right: 15px;">` : ''}
                </div>
                <div class="card-meta-primary">${session.year} | ${session.location} | ${session.session_name}</div>
                <div class="card-meta-secondary">${session.country_name} • ${weatherCondition}</div>
            `;

            // Add the newly created card to the grid.
            gridContainer.appendChild(card);
        }
    }

    // This is the main function to get and display session data.
    async function fetchAndDisplaySessions() {
        const cacheKey = 'f1HistoryData';
        const cacheTimestampKey = 'f1HistoryTimestamp';
        const cacheDuration = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

        const cachedData = localStorage.getItem(cacheKey);
        const cachedTimestamp = localStorage.getItem(cacheTimestampKey);
        const now = new Date().getTime();

        // If we have fresh data in the cache, use it.
        if (cachedData && cachedTimestamp && (now - cachedTimestamp < cacheDuration)) {
            console.log("Loading F1 history from cache.");
            const allSessions = JSON.parse(cachedData);
            await renderPage(allSessions);
            return; // Exit the function
        }

        // If cache is old or doesn't exist, fetch from API.
        console.log("Fetching fresh F1 history from API.");
        mainContentContainer.innerHTML = '<p style="color: white; font-size: 1.2rem; padding: 2rem;">Loading race history...</p>';

        try {
            const currentYear = new Date().getFullYear();
            const startYear = 2018;
            let allSessions = [];

            // 1. Fetch all sessions for all years. This is more reliable than fetching all meetings at once.
            const fetchPromises = [];
            for (let year = startYear; year <= currentYear; year++) {
                fetchPromises.push(
                    fetch(`https://api.openf1.org/v1/sessions?year=${year}`)
                        .then(response => response.ok ? response.json() : [])
                );
            }

            const yearlySessions = await Promise.all(fetchPromises);
            allSessions = yearlySessions.flat();

            // 2. Define the desired sort order for sessions within a weekend.
            const sessionOrder = { 'Race': 1, 'Qualifying': 2, 'Sprint': 3, 'FP3': 4, 'FP2': 5, 'FP1': 6 };

            // 3. Sort all sessions: primarily by date (descending), and secondarily by session type order.
            allSessions.sort((a, b) => {
                const dateComparison = new Date(b.date_start) - new Date(a.date_start);
                if (dateComparison !== 0) {
                    return dateComparison;
                }
                // If in the same weekend, sort by the defined session order.
                return (sessionOrder[a.session_name] || 99) - (sessionOrder[b.session_name] || 99);
            });

            // Save the freshly fetched and sorted data to the cache.
            localStorage.setItem(cacheKey, JSON.stringify(allSessions));
            localStorage.setItem(cacheTimestampKey, now.toString());
            console.log("F1 history has been cached.");

            // Now render the page with the new data.
            await renderPage(allSessions);

        } catch (error) {
            mainContentContainer.innerHTML = `<p style="color: red; padding: 2rem;">Failed to load race history: ${error.message}</p>`;
            console.error('Error fetching sessions:', error);
        }
    }

    // Call the function to fetch and display the data when the page loads.
    fetchAndDisplaySessions();
});

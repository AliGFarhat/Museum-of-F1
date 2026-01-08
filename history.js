// c:\Users\Ali\Desktop\Assessments\Year 3\Tomorrow's Web\Assessment 1\Museum-of-F1\history.js

document.addEventListener('DOMContentLoaded', () => {
    // Select the main content area that will hold the page header and the grid.
    const mainContentContainer = document.querySelector('.main-content');
    const sidebar = document.querySelector('.sidebar');

    // If the container doesn't exist, stop the script to avoid errors.
    if (!mainContentContainer) {
        console.error('Main content container (.main-content) not found.');
        return;
    }

    let globalSessions = []; // Store sessions globally for filtering

    // This function handles rendering the page content from the session data.
    async function renderPage(allSessions, weatherFilters = []) {
        // Pagination settings: 2 rows (approx 6 items) initially, then 6 rows (approx 18 items)
        const INITIAL_BATCH = 6;
        const LOAD_MORE_BATCH = 18;

        // Clear the main content area and rebuild its structure.
        mainContentContainer.innerHTML = `
            <header class="page-header">
                <h1 class="page-title">Formula 1 History</h1>
                <p class="page-subtitle">Explore races from the history of Formula 1</p>
            </header>
            <div class="grid"></div>
            <div class="load-more-container" style="text-align: center; padding: 2rem;">
                <button id="load-more-btn" class="btn-red" style="display: none; margin: 0 auto; padding: 10px 20px; cursor: pointer; border-radius: 4px; background-color: #e10600; color: white; border: none; font-family: 'Formula Font', sans-serif;">Load More</button>
            </div>
        `;

        // Now, select the newly created grid container.
        const gridContainer = mainContentContainer.querySelector('.grid');
        const loadMoreBtn = mainContentContainer.querySelector('#load-more-btn');
        
        if (!allSessions || allSessions.length === 0) {
            gridContainer.innerHTML = '<p style="color: white;">No sessions found.</p>';
            return;
        }

        // A helper object to map meeting names from the API to your image files.
        const trackImages = {
            'Monaco': 'images/tracks/monaco.png',
            'Monte Carlo': 'images/tracks/monaco.png',
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
            'Miami International Autodrome': 'images/tracks/miami.png',
            'Miami Gardens': 'images/tracks/miami.png',
            'Imola': 'images/tracks/imola.png',

            'Barcelona': 'images/tracks/spain.png',
            'Madrid': 'images/tracks/spain.png',
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

        let currentSessionIndex = 0;
        let isProcessing = false;

        // Helper function to process a session and return a card (or null if filtered)
        async function createSessionCard(session) {
            // Determine flag image
            let countryKey = session.country_name;
            if (countryKey === 'United States') countryKey = 'USA';
            if (countryKey === 'United Arab Emirates') countryKey = 'UAE';
            
            const countryFlag = flagImages[countryKey];

            // Fetch weather data for this specific session if not already cached
            let weatherCondition = session.weatherCondition;
            if (!weatherCondition) {
                try {
                    const weatherResponse = await fetch(`https://api.openf1.org/v1/weather?session_key=${session.session_key}`);
                    weatherCondition = 'N/A'; // Default to N/A

                    if (weatherResponse.ok) {
                        const contentType = weatherResponse.headers.get("content-type");
                        if (contentType && contentType.indexOf("application/json") !== -1) {
                            const weatherData = await weatherResponse.json();
                            if (Array.isArray(weatherData)) {
                                const hadRain = weatherData.some(dataPoint => dataPoint.rainfall > 0);
                                weatherCondition = hadRain ? 'Wet' : 'Dry';
                            }
                        }
                    }
                } catch (e) {
                    weatherCondition = 'N/A';
                }
                session.weatherCondition = weatherCondition; // Cache it
            }

            // Apply Weather Filter
            if (weatherFilters.length > 0 && !weatherFilters.includes(weatherCondition)) {
                return null;
            }

            // Get the correct image path, or a default one if not found.
            const imageUrl = trackImages[session.location] || 'images/tracks/default.png';
            
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <div class="image-placeholder" style="position: relative; overflow: hidden;">
                    <img src="${imageUrl}" alt="${session.location}" style="width: 100%; height: 100%; object-fit: contain; position: absolute; top: 0; left: 0;">
                     ${countryFlag ? `<img src="${countryFlag}" alt="${session.country_name} Flag" style="width: 30px; position: absolute; bottom: 15px; right: 15px;">` : ''}
                </div>
                <div class="card-meta-primary">${session.year} | ${session.location} | ${session.session_name}</div>
                <div class="card-meta-secondary">${session.country_name} • ${weatherCondition}</div>
            `;
            return card;
        }

        async function loadBatch(batchSize) {
            if (isProcessing) return;
            isProcessing = true;

            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = '<div class="loader"></div>';
                loadMoreBtn.disabled = true;
            }

            const cardsToAppend = []; // Array to hold finished card elements

            // Loop until we find enough cards or run out of sessions
            while (currentSessionIndex < allSessions.length && cardsToAppend.length < batchSize) {
                // Stop if the grid container is no longer in the DOM (page changed)
                if (!document.body.contains(gridContainer)) return;

                // Determine how many items to fetch in this chunk
                const needed = batchSize - cardsToAppend.length;
                const chunk = allSessions.slice(currentSessionIndex, currentSessionIndex + needed);
                
                // Create promises with staggered start to avoid rate limits
                const promises = chunk.map((session, index) => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(createSessionCard(session));
                        }, index * 150); // 150ms delay between starts
                    });
                });

                const results = await Promise.all(promises);
                
                results.forEach(card => {
                    if (card) cardsToAppend.push(card);
                });

                currentSessionIndex += chunk.length;
            }

            // Now, append all collected cards at once
            const fragment = document.createDocumentFragment();
            cardsToAppend.forEach(card => fragment.appendChild(card));
            gridContainer.appendChild(fragment);

            // Update Load More Button
            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = 'Load More';
                loadMoreBtn.disabled = false;
                
                // Hide button if we've processed all sessions
                if (currentSessionIndex >= allSessions.length) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.style.display = 'inline-flex';
                }
            }
            isProcessing = false;
        }

        // Attach event listener
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => loadBatch(LOAD_MORE_BATCH));
        }

        // Initial load
        await loadBatch(INITIAL_BATCH);
    }

    function populateSidebar(sessions) {
        if (!sidebar) return;

        const getUniqueValues = (data, key) => [...new Set(data.map(item => item[key]))].sort();
        
        const years = getUniqueValues(sessions, 'year').sort((a, b) => b - a);
        const tracks = getUniqueValues(sessions, 'location');
        
        // Get all available session names from data
        const availableSessionNames = new Set(sessions.map(s => s.session_name));

        // Define the desired order and labels for sessions
        const sessionConfig = [
            { key: 'Practice 1', label: 'Practice 1' },
            { key: 'Practice 2', label: 'Practice 2' },
            { key: 'Practice 3', label: 'Practice 3' },
            { key: 'Sprint Qualifying', label: 'Sprint Qualifying' },
            { key: 'Sprint Shootout', label: 'Sprint Qualifying' }, // Map 2023 name to desired label
            { key: 'Sprint', label: 'Sprint Race' },
            { key: 'Qualifying', label: 'Qualifying' },
            { key: 'Race', label: 'Race' }
        ];

        // Filter config to only include sessions present in data (removes "Day 1", etc.)
        const activeSessionConfig = sessionConfig.filter(item => availableSessionNames.has(item.key));

        sidebar.innerHTML = `
            <div class="sidebar-title">Filters</div>
            
            <div class="filter-group">
                <span class="filter-header">Year</span>
                ${years.map(year => `
                    <label class="checkbox-item">
                        <input type="checkbox" value="${year}" data-filter-type="year"> <span class="checkbox-label">${year}</span>
                    </label>
                `).join('')}
            </div>

            <div class="filter-group">
                <span class="filter-header">Track</span>
                ${tracks.map(track => `
                    <label class="checkbox-item">
                        <input type="checkbox" value="${track}" data-filter-type="track"> <span class="checkbox-label">${track}</span>
                    </label>
                `).join('')}
            </div>

            <div class="filter-group">
                <span class="filter-header">Weather</span>
                <label class="checkbox-item"><input type="checkbox" value="Dry" data-filter-type="weather"> <span class="checkbox-label">Dry</span></label>
                <label class="checkbox-item"><input type="checkbox" value="Wet" data-filter-type="weather"> <span class="checkbox-label">Wet</span></label>
            </div>

            <div class="filter-group">
                <span class="filter-header">Session</span>
                ${activeSessionConfig.map(config => `
                    <label class="checkbox-item">
                        <input type="checkbox" value="${config.key}" data-filter-type="session"> <span class="checkbox-label">${config.label}</span>
                    </label>
                `).join('')}
            </div>
        `;

        sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', handleFilterChange);
        });
    }

    async function handleFilterChange() {
        const getChecked = (type) => Array.from(sidebar.querySelectorAll(`input[data-filter-type="${type}"]:checked`)).map(cb => cb.value);
        
        const activeYears = getChecked('year').map(Number);
        const activeTracks = getChecked('track');
        const activeWeather = getChecked('weather');
        const activeSessions = getChecked('session');

        const filtered = globalSessions.filter(session => {
            return (activeYears.length === 0 || activeYears.includes(session.year)) &&
                   (activeTracks.length === 0 || activeTracks.includes(session.location)) &&
                   (activeSessions.length === 0 || activeSessions.includes(session.session_name));
        });

        await renderPage(filtered, activeWeather);
    }

    // This is the main function to get and display session data.
    async function fetchAndDisplaySessions() {
        const cacheKey = 'f1HistoryData_v5';
        const cacheTimestampKey = 'f1HistoryTimestamp_v5';
        const cacheDuration = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

        const cachedData = localStorage.getItem(cacheKey);
        const cachedTimestamp = localStorage.getItem(cacheTimestampKey);
        const now = new Date().getTime();

        // If we have fresh data in the cache, use it.
        if (cachedData && cachedTimestamp && (now - cachedTimestamp < cacheDuration)) {
            console.log("Loading F1 history from cache.");
            const allSessions = JSON.parse(cachedData);

            // Normalize data immediately for cached data
            allSessions.forEach(session => {
                if (session.location === 'Yas Island') {
                    session.location = 'Yas Marina';
                }
                if (session.location === 'Miami Gardens') {
                    session.location = 'Miami';
                }
            });

            globalSessions = allSessions;
            populateSidebar(allSessions);
            await renderPage(allSessions);
            return; // Exit the function
        }

        // If cache is old or doesn't exist, fetch from API.
        console.log("Fetching fresh F1 history from API.");
        mainContentContainer.innerHTML = '<p style="color: white; font-size: 1.2rem; padding: 2rem;">Loading race history...</p>';

        try {
            const yearsToFetch = [2023, 2024, 2025, 2026];
            let allSessions = [];

            // 1. Fetch all sessions for all years. This is more reliable than fetching all meetings at once.
            // We use a staggered approach to avoid hitting rate limits with concurrent requests.
            const fetchPromises = yearsToFetch.map((year, index) => 
                new Promise(resolve => setTimeout(resolve, index * 250))
                    .then(() => fetch(`https://api.openf1.org/v1/sessions?year=${year}`))
                    .then(response => response.ok ? response.json() : [])
                    .catch(err => {
                        console.error(`Failed to fetch year ${year}:`, err);
                        return [];
                    })
            );

            const yearlySessions = await Promise.all(fetchPromises);
            allSessions = yearlySessions.flat();

            // Normalize data immediately
            allSessions.forEach(session => {
                if (session.location === 'Yas Island') {
                    session.location = 'Yas Marina';
                }
                if (session.location === 'Miami Gardens') {
                    session.location = 'Miami';
                }
            });

            // 2. Define the desired sort order for sessions within a weekend.
            const sessionOrder = { 
                'Race': 1, 
                'Qualifying': 2, 
                'Sprint': 3, 
                'Sprint Shootout': 4,
                'Sprint Qualifying': 4,
                'Practice 3': 5, 
                'Practice 2': 6, 
                'Practice 1': 7 
            };

            // 3. Sort all sessions: primarily by date (descending), and secondarily by session type order.
            allSessions.sort((a, b) => {
                const dateA = new Date(a.date_start);
                const dateB = new Date(b.date_start);

                if (isNaN(dateA.getTime())) return -1;
                if (isNaN(dateB.getTime())) return 1;

                const dateComparison = dateB - dateA;
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

            globalSessions = allSessions;
            populateSidebar(allSessions);
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

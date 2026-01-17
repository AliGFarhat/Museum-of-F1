// --- Static Data ---
const TRACK_IMAGES = {
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

const FLAG_IMAGES = {
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

const SESSION_ORDER = { 
    'Race': 1, 
    'Qualifying': 2, 
    'Sprint': 3, 
    'Sprint Shootout': 4,
    'Sprint Qualifying': 4,
    'Practice 3': 5, 
    'Practice 2': 6, 
    'Practice 1': 7 
};

document.addEventListener('DOMContentLoaded', () => {
    // --- Initialization ---
    const mainContentContainer = document.querySelector('.main-content');
    const sidebar = document.querySelector('.sidebar');

    if (!mainContentContainer) {
        console.error('Main content container (.main-content) not found.');
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    let globalSessions = [];

    // --- Render Logic ---
    async function renderPage(allSessions, weatherFilters = []) {
        const INITIAL_BATCH = 6;
        const LOAD_MORE_BATCH = 18;

        mainContentContainer.innerHTML = `
            <header class="page-header">
                <div class="header-title-row">
                    <button id="mobile-filter-btn" class="mobile-filter-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <h1 class="page-title">Formula 1 History</h1>
                </div>
                <p class="page-subtitle">Explore races from the history of Formula 1</p>
            </header>
            <div class="grid"></div>
            <div class="load-more-container" style="text-align: center; padding: 2rem;">
                <button id="load-more-btn" class="btn-red" style="display: none; margin: 0 auto; padding: 10px 20px; cursor: pointer; border-radius: 4px; background-color: #e10600; color: white; border: none; font-family: 'Formula Font', sans-serif;">Load More</button>
            </div>
        `;

        const gridContainer = mainContentContainer.querySelector('.grid');
        const loadMoreBtn = mainContentContainer.querySelector('#load-more-btn');
        const mobileFilterBtn = mainContentContainer.querySelector('#mobile-filter-btn');

        if (mobileFilterBtn) {
            mobileFilterBtn.addEventListener('click', () => {
                sidebar.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (!allSessions || allSessions.length === 0) {
            gridContainer.innerHTML = '<p style="color: white;">No sessions found.</p>';
            return;
        }

        let currentSessionIndex = 0;
        let isProcessing = false;

        async function createSessionCard(session) {
            let countryKey = session.country_name;
            if (countryKey === 'United States') countryKey = 'USA';
            if (countryKey === 'United Arab Emirates') countryKey = 'UAE';
            
            const countryFlag = FLAG_IMAGES[countryKey];

            // Fetch weather data for this specific session if not already cached
            let weatherCondition = session.weatherCondition;
            if (!weatherCondition) {
                try {
                    const weatherResponse = await fetch(`https://api.openf1.org/v1/weather?session_key=${session.session_key}`);
                    weatherCondition = 'N/A';

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
                session.weatherCondition = weatherCondition;
            }

            // Apply Weather Filter
            if (weatherFilters.length > 0 && !weatherFilters.includes(weatherCondition)) {
                return null;
            }

            const imageUrl = TRACK_IMAGES[session.location] || 'images/tracks/default.png';
            
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

            const cardsToAppend = [];

            while (currentSessionIndex < allSessions.length && cardsToAppend.length < batchSize) {
                if (!document.body.contains(gridContainer)) return;

                const needed = batchSize - cardsToAppend.length;
                const chunk = allSessions.slice(currentSessionIndex, currentSessionIndex + needed);
                
                const promises = chunk.map((session, index) => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(createSessionCard(session));
                        }, index * 150);
                    });
                });

                const results = await Promise.all(promises);
                
                results.forEach(card => {
                    if (card) cardsToAppend.push(card);
                });

                currentSessionIndex += chunk.length;
            }

            const fragment = document.createDocumentFragment();
            cardsToAppend.forEach(card => fragment.appendChild(card));
            gridContainer.appendChild(fragment);

            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = 'Load More';
                loadMoreBtn.disabled = false;
                
                if (currentSessionIndex >= allSessions.length) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.style.display = 'inline-flex';
                }
            }
            isProcessing = false;
        }

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => loadBatch(LOAD_MORE_BATCH));
        }

        await loadBatch(INITIAL_BATCH);
    }

    // --- Sidebar Logic ---
    function populateSidebar(sessions) {
        if (!sidebar) return;

        const getUniqueValues = (data, key) => [...new Set(data.map(item => item[key]))].sort();
        
        const years = getUniqueValues(sessions, 'year').sort((a, b) => b - a);
        const tracks = getUniqueValues(sessions, 'location');
        const availableSessionNames = new Set(sessions.map(s => s.session_name));

        const sessionConfig = [
            { key: 'Practice 1', label: 'Practice 1' },
            { key: 'Practice 2', label: 'Practice 2' },
            { key: 'Practice 3', label: 'Practice 3' },
            { key: 'Sprint Qualifying', label: 'Sprint Qualifying' },
            { key: 'Sprint Shootout', label: 'Sprint Qualifying' },
            { key: 'Sprint', label: 'Sprint Race' },
            { key: 'Qualifying', label: 'Qualifying' },
            { key: 'Race', label: 'Race' }
        ];

        const activeSessionConfig = sessionConfig.filter(item => availableSessionNames.has(item.key));

        sidebar.innerHTML = `
            <button id="sidebar-close-btn" class="sidebar-close-btn">&times;</button>
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

        const closeBtn = sidebar.querySelector('#sidebar-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSidebar);
        }
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
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

    // --- Data Fetching ---
    async function fetchAndDisplaySessions() {
        const cacheKey = 'f1HistoryData_v5';
        const cacheTimestampKey = 'f1HistoryTimestamp_v5';
        const cacheDuration = 6 * 60 * 60 * 1000;

        const cachedData = localStorage.getItem(cacheKey);
        const cachedTimestamp = localStorage.getItem(cacheTimestampKey);
        const now = new Date().getTime();

        const normalizeSession = (session) => {
            if (session.location === 'Yas Island') session.location = 'Yas Marina';
            if (session.location === 'Miami Gardens') session.location = 'Miami';
        };

        if (cachedData && cachedTimestamp && (now - cachedTimestamp < cacheDuration)) {
            console.log("Loading F1 history from cache.");
            const allSessions = JSON.parse(cachedData);
            allSessions.forEach(normalizeSession);
            globalSessions = allSessions;
            populateSidebar(allSessions);
            await renderPage(allSessions);
            return;
        }

        console.log("Fetching fresh F1 history from API.");
        mainContentContainer.innerHTML = '<p style="color: white; font-size: 1.2rem; padding: 2rem;">Loading race history...</p>';

        try {
            const yearsToFetch = [2023, 2024, 2025, 2026];
            let allSessions = [];

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
            allSessions.forEach(normalizeSession);

            allSessions.sort((a, b) => {
                const dateA = new Date(a.date_start);
                const dateB = new Date(b.date_start);

                if (isNaN(dateA.getTime())) return -1;
                if (isNaN(dateB.getTime())) return 1;

                const dateComparison = dateB - dateA;
                if (dateComparison !== 0) {
                    return dateComparison;
                }
                return (SESSION_ORDER[a.session_name] || 99) - (SESSION_ORDER[b.session_name] || 99);
            });

            localStorage.setItem(cacheKey, JSON.stringify(allSessions));
            localStorage.setItem(cacheTimestampKey, now.toString());
            console.log("F1 history has been cached.");

            globalSessions = allSessions;
            populateSidebar(allSessions);
            await renderPage(allSessions);

        } catch (error) {
            mainContentContainer.innerHTML = `<p style="color: red; padding: 2rem;">Failed to load race history: ${error.message}</p>`;
            console.error('Error fetching sessions:', error);
        }
    }

    fetchAndDisplaySessions();
});

document.addEventListener('DOMContentLoaded', () => {
    // --- Page Loader & Theme Init ---
    const init = () => {
        // Apply theme immediately
        if (localStorage.getItem('lightMode') === 'enabled') {
        document.body.classList.add('light-mode');
    }

        // Create and manage loader
    const pageLoader = document.createElement('div');
    pageLoader.id = 'page-loader';
    pageLoader.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(pageLoader);

    setTimeout(() => {
        pageLoader.classList.add('hidden');
        setTimeout(() => {
                if (document.body.contains(pageLoader)) pageLoader.remove();
            }, 500);
        }, 300);
    };
    init();

    // --- DOM Elements ---
    const header = document.querySelector('.header');
    const contentContainer = document.querySelector('.main-content') || document.querySelector('.main');
    const settingsCog = document.getElementById('settings-cog');
    const dropdown = document.getElementById('settings-dropdown');

    let currentRotation = 0;

    // --- Sticky Navbar Logic ---
    if (header && contentContainer) {
        const headerHeight = header.offsetHeight;
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Fixed State
            if (currentScrollY > 0) {
                if (!header.classList.contains('header-fixed')) {
                    header.classList.add('header-fixed');
                    contentContainer.style.paddingTop = `${headerHeight}px`;
                }
            } else {
                header.classList.remove('header-fixed');
                contentContainer.style.paddingTop = '';
                header.classList.remove('hide-nav');
            }

            // Hide/Show on Scroll
            if (currentScrollY > headerHeight) {
                header.classList.toggle('hide-nav', currentScrollY > lastScrollY);
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
    }

    // --- Settings Menu Logic ---
    if (settingsCog) {
        settingsCog.addEventListener('click', () => {
            currentRotation += 180;
            settingsCog.style.transform = `rotate(${currentRotation}deg)`;
            dropdown.classList.toggle('show');
        });

        window.addEventListener('click', (e) => {
            if (dropdown && dropdown.classList.contains('show') && 
                !dropdown.contains(e.target) && 
                !settingsCog.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    // --- Feedback Form Logic ---
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = event.target.email.value;
            const feedback = event.target.feedback.value;
            const sendButton = event.target.querySelector('.send-feedback-btn');

            sendButton.textContent = 'SENDING...';
            sendButton.disabled = true;

            try {
                const response = await fetch('https://museum-of-f1.onrender.com/:5000/send-feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, feedback }),
                });

                const data = await response.json();
                const modal = document.getElementById('login-modal');

                if (window.f1Auth && modal) {
                    modal.classList.add('show-modal');
                    document.body.classList.add('modal-open');
                    
                    window.f1Auth.showStatusMessage(
                        modal, 
                        response.ok ? 'Success' : 'Error', 
                        data.message, 
                        response.ok ? 'success' : 'error', 
                        2500,
                        () => {
                            modal.classList.remove('show-modal');
                            document.body.classList.remove('modal-open');
                            setTimeout(() => window.f1Auth.resetLoginModal(), 300);
                        }
                    );
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred connecting to the server.');
            }
            
            sendButton.textContent = 'SEND';
            sendButton.disabled = false;
            feedbackForm.reset();
        });
    }

    // --- Display Mode Logic ---
    const lightModeBtn = document.getElementById('light-mode-btn');
    const darkModeBtn = document.getElementById('dark-mode-btn');

    const updateActiveState = () => {
        const isLight = document.body.classList.contains('light-mode');
        if (lightModeBtn) lightModeBtn.classList.toggle('active', isLight);
        if (darkModeBtn) darkModeBtn.classList.toggle('active', !isLight);
    };

    const enableLightMode = () => {
        document.body.classList.add('light-mode');
        localStorage.setItem('lightMode', 'enabled');
        updateActiveState();
    };

    const disableLightMode = () => {
        document.body.classList.remove('light-mode');
        localStorage.setItem('lightMode', 'disabled');
        updateActiveState();
    };

    // Init Display Mode
    updateActiveState();
    if (lightModeBtn) lightModeBtn.addEventListener('click', enableLightMode);
    if (darkModeBtn) darkModeBtn.addEventListener('click', disableLightMode);

    // --- Admin Status Check ---
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser) {
        if (currentUser.isAdmin === undefined) {
            currentUser.isAdmin = false;
            localStorage.setItem('user', JSON.stringify(currentUser));
        }
        if (currentUser.isAdmin) {
            document.body.classList.add('admin-access');
            console.log('Admin privileges active');
        }
    }

    // --- Dynamic Content Loading ---
    const loadContent = async () => {
        try {
            // 1. Featured Race
            const featuredRes = await fetch('https://museum-of-f1.onrender.com/:5000/content/featured');
            const featuredData = await featuredRes.json();
            
            if (featuredData) {
                const heroText = document.querySelector('.hero-text');
                const heroPic = document.querySelector('.hero-pic img');
                
                if (heroText && featuredData.title) {
                    heroText.innerHTML = `
                        ${featuredData.title}
                        <div style="font-size: 1rem; margin-top: 0.5rem; font-family: 'Titillium Web';">${featuredData.description}</div>
                    `;
                }
                if (heroPic && featuredData.imageUrl) {
                    heroPic.src = featuredData.imageUrl;
                }

                // Update Featured Entries (1-5)
                const featuredItems = document.querySelectorAll('.hero-right .featured');
                featuredItems.forEach((item, index) => {
                    const i = index + 1; // 1-based index for data fields
                    const text = item.querySelector('p');
                    const img = item.querySelector('.featured-image');
                    const contentContainer = item.querySelector('.featured-content');

                    // Find or create header
                    let header = item.querySelector(`#featured-header-${i}`) || item.querySelector('h3, h4, h5, h6');
                    if (!header && contentContainer && contentContainer.firstElementChild) {
                        if (contentContainer.firstElementChild !== text) {
                            header = contentContainer.firstElementChild;
                        }
                    }

                    // Style header
                    if (header) {
                        header.style.color = '#d6176f';
                        header.id = `featured-header-${i}`;
                    }

                    // Update Content
                    if (featuredData[`entry_${i}_header`]) {
                        const headerText = featuredData[`entry_${i}_header`].toUpperCase();
                        if (header) {
                            header.textContent = headerText;
                        } else if (contentContainer) {
                            header = document.createElement('h3');
                            header.textContent = headerText;
                            header.style.color = '#d6176f';
                            header.id = `featured-header-${i}`;
                            contentContainer.insertBefore(header, contentContainer.firstChild);
                        }
                    }
                    if (featuredData[`entry_${i}_text`] && text) {
                        text.textContent = featuredData[`entry_${i}_text`];
                    }
                    if (featuredData[`entry_${i}_image`] && img) {
                        img.src = featuredData[`entry_${i}_image`];
                    }
                });
            }

            // 2. Spotlights
            const spotlightRes = await fetch('https://museum-of-f1.onrender.com/:5000/content/spotlights');
            const spotlightsData = await spotlightRes.json();
            
            const spotlights = [];
            for (let i = 1; i <= 6; i++) {
                if (spotlightsData[`spotlight_${i}_image`] || spotlightsData[`spotlight_${i}_title`]) {
                    spotlights.push({
                        title: spotlightsData[`spotlight_${i}_title`] || '',
                        imageUrl: spotlightsData[`spotlight_${i}_image`] || ''
                    });
                }
            }

            // Map DB items to DOM elements
            const grid1 = document.querySelector('.spotlight-grid');
            const grid2 = document.querySelector('.spotlight-grid-flipped');
            
            const getContainer = (grid, selector) => grid ? grid.querySelector(selector) : null;
            
            const containers = [
                // Row 1
                { container: getContainer(grid1, '.spotlight-left'), imgClass: '.spot-lg img', textContainer: '.spot-txt' },
                { container: getContainer(grid1, '.spotlight-middle'), imgClass: '.spot-sm img', textContainer: '.spotlight-text' },
                { container: getContainer(grid1, '.spotlight-right'), imgClass: '.spot-sm img', textContainer: '.spotlight-text' },
                // Row 2 (Flipped: Left=Small, Middle=Small, Right=Large)
                { container: getContainer(grid2, '.spotlight-left'), imgClass: '.spot-sm img', textContainer: '.spotlight-text' },
                { container: getContainer(grid2, '.spotlight-middle'), imgClass: '.spot-sm img', textContainer: '.spotlight-text' },
                { container: getContainer(grid2, '.spotlight-right'), imgClass: '.spot-lg img', textContainer: '.spot-txt' }
            ];

            spotlights.forEach((item, index) => {
                if (index < containers.length && containers[index].container) {
                    const target = containers[index];
                    const img = containers[index].container.querySelector(target.imgClass);
                    const txt = containers[index].container.querySelector(target.textContainer);

                    if (img && item.imageUrl) img.src = item.imageUrl;
                    if (txt) {
                        const headerTag = target.textContainer === '.spot-txt' ? 'h3' : 'h4';
                        const header = txt.querySelector(headerTag);
                        if (header) {
                            header.textContent = item.title;
                        } else {
                            txt.innerHTML = `<${headerTag}>${item.title}</${headerTag}>`;
                        }
                    }
                }
            });
        } catch (e) {
            console.error("Failed to load dynamic content", e);
        }
    };

    loadContent();
});
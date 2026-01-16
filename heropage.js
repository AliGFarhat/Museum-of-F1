document.addEventListener('DOMContentLoaded', () => {
    // --- Page Loader & Theme Init ---
    // Apply theme immediately to ensure loader has correct background
    const savedTheme = localStorage.getItem('lightMode');
    if (savedTheme === 'enabled') {
        document.body.classList.add('light-mode');
    }

    const pageLoader = document.createElement('div');
    pageLoader.id = 'page-loader';
    pageLoader.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(pageLoader);

    setTimeout(() => {
        pageLoader.classList.add('hidden');
        setTimeout(() => {
            if (document.body.contains(pageLoader)) {
                pageLoader.remove();
            }
        }, 500);
    }, 300);
    // -------------------------------

    const header = document.querySelector('.header');
    // Find the correct content container, whether it's .main or .main-content
    const contentContainer = document.querySelector('.main-content') || document.querySelector('.main');
    const settingsCog = document.getElementById('settings-cog');
    const dropdown = document.getElementById('settings-dropdown');

    let currentRotation = 0; // Variable to track rotation

    // Sticky Navbar Logic
    if (header && contentContainer) {
        const headerHeight = header.offsetHeight;
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Handle Fixed State
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

            // Handle Hide/Show on Scroll
            if (currentScrollY > headerHeight) {
                if (currentScrollY > lastScrollY) {
                    // Scrolling Down
                    header.classList.add('hide-nav');
                } else {
                    // Scrolling Up
                    header.classList.remove('hide-nav');
                }
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);
        // Run once on load to set initial state
        handleScroll();
    }

    if (settingsCog) {
        settingsCog.addEventListener('click', () => {
            // Increment rotation and apply it
            currentRotation += 180;
            settingsCog.style.transform = `rotate(${currentRotation}deg)`;
            
            // Toggle the dropdown
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        window.addEventListener('click', (e) => {
            if (dropdown && dropdown.classList.contains('show') && 
                !dropdown.contains(e.target) && 
                !settingsCog.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    // Handle Feedback Form Submission
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent the default form submission (page reload)

            const email = event.target.email.value;
            const feedback = event.target.feedback.value;
            const sendButton = event.target.querySelector('.send-feedback-btn');

            sendButton.textContent = 'SENDING...';
            sendButton.disabled = true;

            try {
                const response = await fetch('http://localhost:5000/send-feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, feedback }),
                });

                const data = await response.json();
                const modal = document.getElementById('login-modal');

                // Use the custom modal if available (exposed from auth.js)
                if (window.f1Auth && modal) {
                    modal.classList.add('show-modal');
                    document.body.classList.add('modal-open');
                    
                    window.f1Auth.showStatusMessage(
                        modal, 
                        response.ok ? 'Success' : 'Error', 
                        data.message, 
                        response.ok ? 'success' : 'error', 
                        2500, // Duration
                        () => {
                            modal.classList.remove('show-modal');
                            document.body.classList.remove('modal-open');
                            setTimeout(() => window.f1Auth.resetLoginModal(), 300);
                        }
                    );
                } else {
                    // Fallback if modal logic isn't loaded
                    alert(data.message);
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred connecting to the server.');
            }
            sendButton.textContent = 'SEND';
            sendButton.disabled = false;
            feedbackForm.reset(); // Clear the form
        });
    }

    // Handle Display Mode Menu
    // Get the state from localStorage
    let lightMode = localStorage.getItem('lightMode'); 

    const displayModeToggle = document.getElementById('display-mode-toggle');
    const displayModeMenu = document.getElementById('display-mode-menu');
    const lightModeBtn = document.getElementById('light-mode-btn');
    const darkModeBtn = document.getElementById('dark-mode-btn');

    const updateActiveState = () => {
        if (document.body.classList.contains('light-mode')) {
            if (lightModeBtn) lightModeBtn.classList.add('active');
            if (darkModeBtn) darkModeBtn.classList.remove('active');
        } else {
            if (lightModeBtn) lightModeBtn.classList.remove('active');
            if (darkModeBtn) darkModeBtn.classList.add('active');
        }
    };

    // Function to enable light mode
    const enableLightMode = () => {
        document.body.classList.add('light-mode');
        localStorage.setItem('lightMode', 'enabled');
        updateActiveState();
    };

    // Function to disable light mode (revert to dark mode)
    const disableLightMode = () => {
        document.body.classList.remove('light-mode');
        localStorage.setItem('lightMode', 'disabled');
        updateActiveState();
    };

    // Check if light mode is enabled on page load
    if (lightMode === 'enabled') {
        enableLightMode();
    } else {
        updateActiveState();
    }

    // Add event listeners for the theme buttons
    if (lightModeBtn) lightModeBtn.addEventListener('click', enableLightMode); // Light button enables light mode
    if (darkModeBtn) darkModeBtn.addEventListener('click', disableLightMode); // Dark button disables light mode (goes to dark)

    // Check for Admin Status
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
    const loadDynamicContent = async () => {
        try {
            // 1. Featured Race
            const featuredRes = await fetch('http://localhost:5000/content/featured');
            const featuredData = await featuredRes.json();
            
            if (featuredData) {
                const heroText = document.querySelector('.hero-text');
                const heroPic = document.querySelector('.hero-pic img');
                
                if (heroText && featuredData.title) {
                    // Preserve the structure, just update text
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
                    let header = item.querySelector('h3');
                    const text = item.querySelector('p');
                    const img = item.querySelector('.featured-image');
                    const contentContainer = item.querySelector('.featured-content');

                    // Only update if data exists for this field
                    if (featuredData[`entry_${i}_header`]) {
                        const headerText = featuredData[`entry_${i}_header`].toUpperCase();
                        if (header) {
                            header.textContent = headerText;
                        } else if (contentContainer) {
                            header = document.createElement('h3');
                            header.textContent = headerText;
                            header.style.color = '#d6176f';
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
            const spotlightRes = await fetch('http://localhost:5000/content/spotlights');
            const spotlights = await spotlightRes.json();

            // Map DB items to DOM elements (Left, Middle, Right)
            // We assume the order of fetch (latest first) maps to Left (Large), Middle, Right
            const containers = [
                { container: document.querySelector('.spotlight-left'), imgClass: '.spotlight-large-image img', textContainer: '.spotlight-left-text' },
                { container: document.querySelector('.spotlight-middle'), imgClass: '.spotlight-small-image img', textContainer: '.spotlight-text' },
                { container: document.querySelector('.spotlight-right'), imgClass: '.spotlight-small-image img', textContainer: '.spotlight-text' }
            ];

            spotlights.forEach((item, index) => {
                if (index < containers.length && containers[index].container) {
                    const target = containers[index];
                    const img = containers[index].container.querySelector(target.imgClass);
                    const txt = containers[index].container.querySelector(target.textContainer);

                    if (img) img.src = item.imageUrl;
                    if (txt) txt.innerHTML = `<h3>${item.title}</h3><p>${item.description}</p>`; // Adjust h3/h4 based on existing HTML if needed, but innerHTML replace works
                }
            });
        } catch (e) {
            console.error("Failed to load dynamic content", e);
        }
    };

    loadDynamicContent();
});
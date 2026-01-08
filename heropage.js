document.addEventListener('DOMContentLoaded', () => {
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

});
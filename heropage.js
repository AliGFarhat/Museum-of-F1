document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    // Find the correct content container, whether it's .main or .main-content
    const contentContainer = document.querySelector('.main-content') || document.querySelector('.main');
    const settingsCog = document.getElementById('settings-cog');
    const dropdown = document.getElementById('settings-dropdown');
    const loginModal = document.getElementById('login-modal');
    const loginRegisterBtn = document.getElementById('login-register-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    let currentRotation = 0; // Variable to track rotation

    // Sticky Navbar Logic
    if (header && contentContainer) {
        const headerOffsetTop = header.offsetTop;
        const headerHeight = header.offsetHeight;

        window.addEventListener('scroll', () => {
            if (window.scrollY >= headerOffsetTop) {
                // When scrolled past the header's original position, make it fixed.
                if (!header.classList.contains('header-fixed')) {
                    header.classList.add('header-fixed');
                    // Add padding to the content container to prevent the layout jump.
                    contentContainer.style.paddingTop = `${headerHeight}px`;
                }
            } else {
                // When scrolling back up to the "magnet" point, un-fix it.
                if (header.classList.contains('header-fixed')) {
                    header.classList.remove('header-fixed');
                    contentContainer.style.paddingTop = ''; // Remove the padding
                }
            }
        });
    }

    if (settingsCog) {
        settingsCog.addEventListener('click', () => {
            // Increment rotation and apply it
            currentRotation += 180;
            settingsCog.style.transform = `rotate(${currentRotation}deg)`;
            
            // Toggle the dropdown
            dropdown.classList.toggle('show');
        });
    }

    // Show modal when login/register button is clicked
    if (loginRegisterBtn) {
        loginRegisterBtn.addEventListener('click', () => {
            loginModal.classList.add('show-modal');
            document.body.classList.add('modal-open'); // Prevent body scroll
            dropdown.classList.remove('show'); // Hide dropdown after opening modal
        });
    }

    // Hide modal when close button is clicked
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            loginModal.classList.remove('show-modal');
            document.body.classList.remove('modal-open'); // Allow body scroll
        });
    }

    // Hide modal if user clicks outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target == loginModal) {
            loginModal.classList.remove('show-modal');
            document.body.classList.remove('modal-open'); // Allow body scroll
        }
    });

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
                const response = await fetch('http://localhost:3000/send-feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, feedback }),
                });

                alert(await response.text()); // Show success/error message from server
            } catch (error) {
                alert('An error occurred. Please try again later.');
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

    // Function to enable light mode
    const enableLightMode = () => {
        document.body.classList.add('light-mode');
        localStorage.setItem('lightMode', 'enabled');
    };

    // Function to disable light mode (revert to dark mode)
    const disableLightMode = () => {
        document.body.classList.remove('light-mode');
        localStorage.setItem('lightMode', 'disabled');
    };

    // Check if light mode is enabled on page load
    if (lightMode === 'enabled') {
        enableLightMode();
    }

    if (displayModeToggle && displayModeMenu) {
        displayModeToggle.addEventListener('click', () => {
            displayModeMenu.classList.toggle('show');
        });
    }

    // Add event listeners for the theme buttons
    if (lightModeBtn) lightModeBtn.addEventListener('click', enableLightMode); // Light button enables light mode
    if (darkModeBtn) darkModeBtn.addEventListener('click', disableLightMode); // Dark button disables light mode (goes to dark)

});
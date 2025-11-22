document.addEventListener('DOMContentLoaded', () => {
    const settingsCog = document.getElementById('settings-cog');
    const dropdown = document.getElementById('settings-dropdown');
    const loginModal = document.getElementById('login-modal');
    const loginRegisterBtn = document.getElementById('login-register-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    let currentRotation = 0; // Variable to track rotation

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
    const displayModeToggle = document.getElementById('display-mode-toggle');
    const displayModeMenu = document.getElementById('display-mode-menu');

    if (displayModeToggle && displayModeMenu) {
        displayModeToggle.addEventListener('click', () => {
            displayModeMenu.classList.toggle('show');
        });
    }
});
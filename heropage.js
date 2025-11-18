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
});
document.addEventListener('DOMContentLoaded', () => {
    const settingsCog = document.getElementById('settings-cog');
    const dropdown = document.getElementById('settings-dropdown');
    const loginModal = document.getElementById('login-modal');
    const loginRegisterBtn = document.getElementById('login-register-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    if (settingsCog) {
        settingsCog.addEventListener('click', () => {
            // Animate the cog
            settingsCog.classList.add('rotate');
            setTimeout(() => {
                settingsCog.classList.remove('rotate');
            }, 500); // This duration should match the CSS transition duration

            // Toggle the dropdown
            dropdown.classList.toggle('show');
        });
    }

    // Show modal when login/register button is clicked
    if (loginRegisterBtn) {
        loginRegisterBtn.addEventListener('click', () => {
            loginModal.style.display = 'block';
            dropdown.classList.remove('show'); // Hide dropdown after opening modal
        });
    }

    // Hide modal when close button is clicked
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
    }

    // Hide modal if user clicks outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target == loginModal) {
            loginModal.style.display = 'none';
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const displayModeBtn = document.getElementById('display-mode-toggle');
    const displayModeMenu = document.getElementById('display-mode-menu');

    if (displayModeBtn && displayModeMenu) {
        // Toggle menu visibility on button click
        displayModeBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from propagating to document
            displayModeMenu.classList.toggle('show');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (displayModeMenu.classList.contains('show')) {
                // Check if the click is outside the menu and the button
                if (!displayModeMenu.contains(event.target) && !displayModeBtn.contains(event.target)) {
                    displayModeMenu.classList.remove('show');
                }
            }
        });
    }
});
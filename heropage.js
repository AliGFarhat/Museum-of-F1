document.addEventListener('DOMContentLoaded', () => {
    const settingsCog = document.getElementById('settings-cog');

    if (settingsCog) {
        settingsCog.addEventListener('click', () => {
            settingsCog.classList.add('rotate');

            setTimeout(() => {
                settingsCog.classList.remove('rotate');
            }, 500); // This duration should match the CSS transition duration
        });
    }
});
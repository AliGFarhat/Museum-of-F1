document.addEventListener('DOMContentLoaded', () => {
    // Select DOM elements
    const loginBtn = document.getElementById('login-register-btn'); // Updated to match HTML
    const modal = document.getElementById('login-modal'); // Updated to match HTML
    const closeBtn = document.getElementById('close-modal-btn'); // Updated to match HTML
    const authForm = document.getElementById('login-form'); // Updated to match HTML
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    const toggleText = document.getElementById('toggleText');
    const toggleAction = document.getElementById('toggleAction');
    const emailInput = document.getElementById('email');
    const emailLabel = document.getElementById('email-label');
    const registerUsernameContainer = document.getElementById('register-username-container');
    const registerUsernameInput = document.getElementById('register-username');
    const registerUsernameFeedback = document.getElementById('register-username-feedback');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    
    // Account Modal Elements
    const accountModal = document.getElementById('account-modal');
    const closeAccountBtn = document.getElementById('close-account-modal-btn');
    const accountModalTitle = document.getElementById('accountModalTitle');
    const logoutBtn = document.getElementById('logout-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const changeUsernameBtn = document.getElementById('change-username-btn');
    const changeUsernameForm = document.getElementById('change-username-form');
    const newUsernameInput = document.getElementById('new-username-input');
    const changeUsernameFeedback = document.getElementById('change-username-feedback');
    const saveUsernameBtn = document.getElementById('save-username-btn');
    const cancelUsernameBtn = document.getElementById('cancel-username-btn');

    let isLoginMode = true;

    // Check if user is already logged in (persisted session)
    const storedUser = localStorage.getItem('user');
    if (storedUser && loginBtn) {
        loginBtn.textContent = 'Account';
    }

    // Handle Navbar Button Click (Login / Logout)
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (localStorage.getItem('user')) {
                // User is logged in, open Account Modal
                if (accountModal) {
                    // Update modal title with username
                    const user = JSON.parse(localStorage.getItem('user'));
                    if (accountModalTitle && user && user.username) {
                        accountModalTitle.textContent = `Hello, ${user.username}`;
                    }
                    accountModal.classList.add('show-modal');
                    document.body.classList.add('modal-open');

                    // Ensure login modal is closed (fixes conflict with heropage.js)
                    if (modal) modal.classList.remove('show-modal');
                }
            } else {
                // User is not logged in, open Modal
                if (modal) modal.classList.add('show-modal');
                document.body.classList.add('modal-open');
            }
        });
    }

    // Close Modal (X button)
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show-modal');
            document.body.classList.remove('modal-open');
        });
    }

    // Helper to reset change username section
    const resetChangeUsernameSection = () => {
        if (changeUsernameForm) changeUsernameForm.classList.remove('show');
        if (changeUsernameBtn) changeUsernameBtn.style.display = 'block';
        if (newUsernameInput) newUsernameInput.value = '';
        if (changeUsernameFeedback) changeUsernameFeedback.textContent = '';
    };

    // Close Account Modal (X button)
    if (closeAccountBtn) {
        closeAccountBtn.addEventListener('click', () => {
            accountModal.classList.remove('show-modal');
            document.body.classList.remove('modal-open');
            resetChangeUsernameSection();
        });
    }

    // Close Modal (Click outside)
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show-modal');
            document.body.classList.remove('modal-open');
        }
        if (e.target === accountModal) {
            accountModal.classList.remove('show-modal');
            document.body.classList.remove('modal-open');
            resetChangeUsernameSection();
        }
    });

    // Toggle between Login and Register views
    if (toggleAction) {
        toggleAction.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            
            if (isLoginMode) {
                modalTitle.textContent = 'Login';
                submitBtn.textContent = 'Login';
                toggleText.textContent = "Don't have an account? ";
                toggleAction.textContent = "Register";
                registerUsernameContainer.style.display = 'none';
                emailLabel.textContent = 'Email / Username';
                registerUsernameInput.required = false;
                registerUsernameInput.value = '';
                registerUsernameFeedback.textContent = '';
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            } else {
                modalTitle.textContent = 'Register';
                submitBtn.textContent = 'Register';
                toggleText.textContent = "Already have an account? ";
                toggleAction.textContent = "Login";
                registerUsernameContainer.style.display = 'block';
                emailLabel.textContent = 'Email';
                registerUsernameInput.required = true;
            }
        });
    }

    // Handle Form Submission
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const username = registerUsernameInput.value.trim();

            if (email.includes(' ') || password.includes(' ')) {
                alert('Spaces are not allowed in email or password.');
                return;
            }

            if (!isLoginMode) {
                if (username.includes(' ')) {
                    alert('Spaces are not allowed in username.');
                    return;
                }
                if (!/^[a-zA-Z0-9]+$/.test(username)) {
                    alert('Username must not contain special characters.');
                    return;
                }
            }

            const endpoint = isLoginMode ? '/login' : '/register';
            const url = `http://localhost:5000${endpoint}`;
            
            const bodyData = { email, password };
            if (!isLoginMode) {
                bodyData.username = username;
            }

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData)
                });

                const data = await response.json();

                if (response.ok) {
                    if (isLoginMode) {
                        // Login Success
                        // No alert for login as requested
                        localStorage.setItem('user', JSON.stringify(data.user));
                        modal.classList.remove('show-modal');
                        document.body.classList.remove('modal-open');
                        loginBtn.textContent = 'Account';
                        
                        // Clear inputs
                        emailInput.value = '';
                        passwordInput.value = '';
                        registerUsernameInput.value = '';
                    } else {
                        alert(data.message); // Keep alert for registration
                        // Registration Success - Switch to login view
                        toggleAction.click();
                    }
                } else {
                    // Server returned an error (e.g., "User already exists")
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to connect to the server. Ensure backend is running on port 5000.');
            }
        });
    }

    // Password Visibility Toggle Logic
    if (passwordInput && togglePassword) {
        // Show/Hide icon based on input value
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value.length > 0) {
                togglePassword.style.display = 'block';
            } else {
                togglePassword.style.display = 'none';
            }
        });

        // Toggle Password Type and Icon
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            if (type === 'text') {
                // Show Slash Eye (Red) - means "Click to Hide"
                togglePassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e10600"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`;
            } else {
                // Show Open Eye (White) - means "Click to Reveal"
                togglePassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
            }
        });
    }

    // --- Username Validation Logic (Debounce) ---
    let debounceTimer;
    const debounce = (func, delay) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(func, delay);
    };

    const checkUsernameAvailability = async (username, feedbackElement, buttonElement) => {
        username = username.trim();
        if (!username) {
            feedbackElement.textContent = '';
            return;
        }

        if (username.includes(' ') || !/^[a-zA-Z0-9]+$/.test(username)) {
            feedbackElement.textContent = 'No spaces or special characters allowed';
            feedbackElement.style.color = '#e10600';
            if (buttonElement) {
                buttonElement.disabled = true;
                buttonElement.style.opacity = '0.5';
                buttonElement.style.cursor = 'not-allowed';
            }
            return;
        }

        // Get current user ID to exclude from check (for Change Username scenario)
        const storedUser = localStorage.getItem('user');
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        const excludeId = currentUser ? currentUser.id : null;

        try {
            const response = await fetch('http://localhost:5000/check-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.toLowerCase(), excludeId })
            });
            const data = await response.json();
            if (data.available) {
                feedbackElement.textContent = 'Username available';
                feedbackElement.style.color = '#00ff00'; // Green
                if (buttonElement) {
                    buttonElement.disabled = false;
                    buttonElement.style.opacity = '1';
                    buttonElement.style.cursor = 'pointer';
                }
            } else {
                feedbackElement.textContent = 'Username taken';
                feedbackElement.style.color = '#e10600'; // F1 Red
                if (buttonElement) {
                    buttonElement.disabled = true;
                    buttonElement.style.opacity = '0.5';
                    buttonElement.style.cursor = 'not-allowed';
                }
            }
        } catch (error) {
            console.error('Error checking username:', error);
        }
    };

    if (registerUsernameInput) {
        registerUsernameInput.addEventListener('input', () => {
            registerUsernameFeedback.textContent = '...';
            registerUsernameFeedback.style.color = '#ccc';
            debounce(() => {
                checkUsernameAvailability(registerUsernameInput.value, registerUsernameFeedback, submitBtn);
            }, 500);
        });
    }

    // --- Account Modal Actions ---

    // Logout Logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            loginBtn.textContent = 'Login';
            accountModal.classList.remove('show-modal');
            document.body.classList.remove('modal-open');
            alert('Logged out successfully');
            window.location.reload();
        });
    }

    // Delete Account Logic
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.id) return;

                try {
                    const response = await fetch('http://localhost:5000/delete-account', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: user.id })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        alert(data.message);
                        // Perform logout after deletion
                        logoutBtn.click();
                    } else {
                        // Handle errors safely (avoid SyntaxError on HTML responses)
                        try {
                            const data = await response.json();
                            alert(data.message || 'Failed to delete account');
                        } catch (e) {
                            alert('Failed to delete account. Server status: ' + response.status);
                        }
                    }
                } catch (error) {
                    console.error('Error deleting account:', error);
                    alert('Server error occurred while deleting account.');
                }
            }
        });
    }

    // Change Username Logic
    if (changeUsernameBtn) {
        changeUsernameBtn.addEventListener('click', () => {
            changeUsernameForm.classList.add('show');
            changeUsernameBtn.style.display = 'none';
        });
    }

    if (cancelUsernameBtn) {
        cancelUsernameBtn.addEventListener('click', () => {
            resetChangeUsernameSection();
        });
    }

    if (newUsernameInput) {
        newUsernameInput.addEventListener('input', () => {
            changeUsernameFeedback.textContent = '...';
            changeUsernameFeedback.style.color = '#ccc';
            debounce(() => {
                checkUsernameAvailability(newUsernameInput.value, changeUsernameFeedback, saveUsernameBtn);
            }, 500);
        });
    }

    if (saveUsernameBtn) {
        saveUsernameBtn.addEventListener('click', async () => {
            const newUsername = newUsernameInput.value.trim();
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!newUsername || !user || !user.id) return;

            if (newUsername.includes(' ')) {
                alert('Spaces are not allowed in username.');
                return;
            }
            if (!/^[a-zA-Z0-9]+$/.test(newUsername)) {
                alert('Username must not contain special characters.');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/change-username', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: user.id, newUsername })
                });

                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    // Update local storage with new username
                    localStorage.setItem('user', JSON.stringify(data.user));
                    if (accountModalTitle) {
                        accountModalTitle.textContent = `Hello, ${data.user.username}`;
                    }
                    cancelUsernameBtn.click(); // Close form
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error changing username:', error);
            }
        });
    }
});
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
    
    // Dynamically create email feedback element if it doesn't exist
    const emailFeedback = document.getElementById('email-feedback') || (() => {
        if (emailInput) {
            const el = document.createElement('div');
            el.id = 'email-feedback';
            el.className = 'validation-text';
            emailInput.insertAdjacentElement('afterend', el);
            return el;
        }
        return null;
    })();

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

    // Helper to update account modal title with admin badge
    // Helper to update account modal title with admin badge
    const updateAccountTitle = (user) => {
        if (accountModalTitle && user && user.username) {
            accountModalTitle.innerHTML = `Hello, ${user.username}`;
            if (user.isAdmin) {
                const badge = document.createElement('span');
                badge.className = 'admin-badge';
                badge.textContent = 'ADMIN';
                accountModalTitle.appendChild(badge);

                // Inject Admin Panel Button if not exists
                if (!document.getElementById('open-admin-panel-btn')) {
                    const adminBtn = document.createElement('button');
                    adminBtn.id = 'open-admin-panel-btn';
                    adminBtn.className = 'account-btn btn-outline-red';
                    adminBtn.textContent = 'Open Admin Panel';
                    adminBtn.style.marginTop = '1rem';
                    adminBtn.addEventListener('click', () => {
                        accountModal.classList.remove('show-modal');
                        openAdminPanel();
                    });
                    // Insert before logout button
                    logoutBtn.parentNode.insertBefore(adminBtn, logoutBtn);
                }
            }
        }
    };

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
                    updateAccountTitle(user);
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

    // Helper to reset login modal
    const resetLoginModal = () => {
        if (emailInput) emailInput.value = '';
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.setAttribute('type', 'password');
        }
        if (registerUsernameInput) registerUsernameInput.value = '';
        if (registerUsernameFeedback) registerUsernameFeedback.textContent = '';
        if (emailFeedback) emailFeedback.textContent = '';
        
        // Reset password toggle
        if (togglePassword) {
            togglePassword.style.display = 'none';
            togglePassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
        }

        // Reset to Login Mode
        isLoginMode = true;
        if (modalTitle) modalTitle.textContent = 'Login';
        if (submitBtn) {
            submitBtn.textContent = 'Login';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
        if (toggleText) toggleText.textContent = "Don't have an account? ";
        if (toggleAction) toggleAction.textContent = "Register";
        if (registerUsernameContainer) registerUsernameContainer.style.display = 'none';
        if (emailLabel) emailLabel.textContent = 'Email / Username';
        if (registerUsernameInput) registerUsernameInput.required = false;

        // Reset any custom message views
        if (modal) {
            const messageViews = modal.querySelectorAll('.modal-message-view');
            messageViews.forEach(view => view.remove());
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                Array.from(modalContent.children).forEach(child => {
                    if (!child.classList.contains('modal-loading-overlay')) {
                        child.style.display = '';
                    }
                });
            }
        }

        // Reset loader overlay
        if (modal) {
            const loaderOverlay = modal.querySelector('.modal-loading-overlay');
            if (loaderOverlay) loaderOverlay.classList.remove('show');
        }
    };

    // Close Modal (X button)
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show-modal');
            document.body.classList.remove('modal-open');
            setTimeout(() => resetLoginModal(), 300);
        });
    }

    // Helper to reset change username section
    const resetChangeUsernameSection = () => {
        if (changeUsernameForm) changeUsernameForm.classList.remove('show');
        if (changeUsernameBtn) changeUsernameBtn.style.display = 'block';
        if (newUsernameInput) newUsernameInput.value = '';
        if (changeUsernameFeedback) changeUsernameFeedback.textContent = '';
        
        // Reset any custom message views in account modal
        if (accountModal) {
            const messageViews = accountModal.querySelectorAll('.modal-message-view');
            messageViews.forEach(view => view.remove());
            const modalContent = accountModal.querySelector('.modal-content');
            if (modalContent) {
                Array.from(modalContent.children).forEach(child => {
                    if (!child.classList.contains('modal-loading-overlay')) {
                        child.style.display = '';
                    }
                });
            }
        }
    };

    // Close Account Modal (X button)
    if (closeAccountBtn) {
        closeAccountBtn.addEventListener('click', () => {
            accountModal.classList.remove('show-modal');
            document.body.classList.remove('modal-open');
            resetChangeUsernameSection();
        });
    }

    // Track mousedown target to prevent closing when dragging from content to overlay
    let mouseDownTarget = null;
    window.addEventListener('mousedown', (e) => {
        mouseDownTarget = e.target;
    });

    // Close Modal (Click outside)
    window.addEventListener('click', (e) => {
        if (e.target === modal && mouseDownTarget === modal) {
            modal.classList.remove('show-modal');
            document.body.classList.remove('modal-open');
            setTimeout(() => resetLoginModal(), 300);
        }
        if (e.target === accountModal && mouseDownTarget === accountModal) {
            accountModal.classList.remove('show-modal');
            document.body.classList.remove('modal-open');
            resetChangeUsernameSection();
        }
    });

    // --- Modal Animation & Message Helpers ---

    const animateModalTransition = (modal, updateContentFn, callback) => {
        const modalContent = modal.querySelector('.modal-content');
        
        // 1. Lock Height
        const startHeight = modalContent.offsetHeight;
        const startWidth = modalContent.offsetWidth;
        modalContent.style.height = `${startHeight}px`;
        modalContent.style.width = `${startWidth}px`;
        modalContent.style.overflow = 'hidden';

        // 2. Show Loader
        let loaderOverlay = modal.querySelector('.modal-loading-overlay');
        if (!loaderOverlay) {
            loaderOverlay = document.createElement('div');
            loaderOverlay.className = 'modal-loading-overlay';
            loaderOverlay.innerHTML = '<div class="loader"></div>';
            modalContent.appendChild(loaderOverlay);
        }
        loaderOverlay.classList.add('show');

        // 3. Wait for loader fade in
        setTimeout(() => {
            // 4. Update Content
            updateContentFn(modalContent);

            // 5. Calculate new height
            modalContent.style.transition = 'none';
            modalContent.style.height = 'auto';
            modalContent.style.width = ''; // Reset width to allow CSS to dictate it
            const targetHeight = modalContent.offsetHeight;
            const targetWidth = modalContent.offsetWidth;

            // 6. Reset to start height
            modalContent.style.height = `${startHeight}px`;
            modalContent.style.width = `${startWidth}px`;
            modalContent.offsetHeight; // Force reflow

            // 7. Animate to target
            modalContent.style.transition = 'all 0.3s ease';
            modalContent.style.height = `${targetHeight}px`;
            modalContent.style.width = `${targetWidth}px`;

            // 8. Cleanup & Hide Loader
            setTimeout(() => {
                // Hide Loader after resize is complete
                loaderOverlay.classList.remove('show');

                modalContent.style.height = 'auto';
                modalContent.style.width = '';
                modalContent.style.overflow = '';
                modalContent.style.transition = '';
                if (callback) callback();
            }, 300);
        }, 500);
    };

    const showStatusMessage = (modal, title, message, type = 'success', duration = 2000, onClose = null) => {
        animateModalTransition(modal, (modalContent) => {
            // Hide original content
            Array.from(modalContent.children).forEach(child => {
                if (!child.classList.contains('modal-loading-overlay')) child.style.display = 'none';
            });

            if (modalContent.classList.contains('admin-modal-content')) {
                modalContent.classList.add('compact-view');
            }

            // Create Message View
            const messageContainer = document.createElement('div');
            messageContainer.className = 'modal-message-view';
            
            let icon = type === 'success' 
                ? `<svg style="width: 48px; height: 48px; color: #00ff00; margin-bottom: 1rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`
                : `<svg style="width: 48px; height: 48px; color: #e10600; margin-bottom: 1rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;

            messageContainer.innerHTML = `
                ${icon}
                <h2 style="margin-bottom: 1rem; font-family: 'Formula Font';">${title}</h2>
                <p style="margin-bottom: 0;">${message}</p>
            `;
            modalContent.appendChild(messageContainer);
        }, () => {
            if (duration > 0) {
                setTimeout(() => {
                    if (onClose) onClose();
                }, duration);
            }
        });
    };

    const showConfirmation = (modal, title, message, onConfirm, onCancel) => {
        animateModalTransition(modal, (modalContent) => {
            // Hide original content
            Array.from(modalContent.children).forEach(child => {
                if (!child.classList.contains('modal-loading-overlay')) child.style.display = 'none';
            });

            if (modalContent.classList.contains('admin-modal-content')) {
                modalContent.classList.add('compact-view');
            }

            const confirmContainer = document.createElement('div');
            confirmContainer.className = 'modal-message-view';
            confirmContainer.innerHTML = `
                <h2 style="margin-bottom: 1rem; font-family: 'Formula Font';">${title}</h2>
                <p>${message}</p>
                <div class="modal-btn-group">
                    <button id="confirm-yes" class="account-btn btn-red">Yes</button>
                    <button id="confirm-no" class="account-btn btn-white">No</button>
                </div>
            `;
            modalContent.appendChild(confirmContainer);

            confirmContainer.querySelector('#confirm-yes').addEventListener('click', onConfirm);
            confirmContainer.querySelector('#confirm-no').addEventListener('click', onCancel);
        });
    };

    // Toggle between Login and Register views
    if (toggleAction) {
        toggleAction.addEventListener('click', (e) => {
            e.preventDefault();
            
            const modalContent = modal.querySelector('.modal-content');
            
            // 1. Lock current height and prevent overflow
            const startHeight = modalContent.offsetHeight;
            modalContent.style.height = `${startHeight}px`;
            modalContent.style.overflow = 'hidden';

            // Create loader if it doesn't exist
            let loaderOverlay = modal.querySelector('.modal-loading-overlay');
            if (!loaderOverlay) {
                if (modalContent) {
                    loaderOverlay = document.createElement('div');
                    loaderOverlay.className = 'modal-loading-overlay';
                    loaderOverlay.innerHTML = '<div class="loader"></div>';
                    modalContent.appendChild(loaderOverlay);
                }
            }

            // Show loader
            if (loaderOverlay) loaderOverlay.classList.add('show');

            requestAnimationFrame(() => {
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
                    if (emailFeedback) emailFeedback.textContent = '';
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
                    if (emailFeedback) emailFeedback.textContent = '';
                }

                // 2. Calculate new height
                // Temporarily disable transition to measure natural height
                modalContent.style.transition = 'none';
                modalContent.style.height = 'auto';
                const targetHeight = modalContent.offsetHeight;

                // 3. Reset to start height
                modalContent.style.height = `${startHeight}px`;
                
                // Force reflow
                modalContent.offsetHeight;

                // 4. Animate to target height
                modalContent.style.transition = 'all 0.3s ease';
                modalContent.style.height = `${targetHeight}px`;

                // 5. Cleanup and Hide Loader
                // Animation takes 300ms. Loader stays 200ms extra. Total 500ms.
                setTimeout(() => {
                    // Hide loader
                    if (loaderOverlay) loaderOverlay.classList.remove('show');

                    modalContent.style.height = 'auto';
                    modalContent.style.overflow = '';
                    modalContent.style.transition = '';
                }, 500);
            });
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
                showStatusMessage(modal, 'Error', 'Spaces are not allowed in email or password.', 'error', 2000, () => resetLoginModal());
                return;
            }

            if (!isLoginMode) {
                if (username.includes(' ')) {
                    showStatusMessage(modal, 'Error', 'Spaces are not allowed in username.', 'error', 2000, () => resetLoginModal());
                    return;
                }
                if (!/^[a-zA-Z0-9]+$/.test(username)) {
                    showStatusMessage(modal, 'Error', 'Username must not contain special characters.', 'error', 2000, () => resetLoginModal());
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
                        showStatusMessage(modal, 'Success', 'Login Successful', 'success', 1500, () => {
                            localStorage.setItem('user', JSON.stringify(data.user));
                            modal.classList.remove('show-modal');
                            document.body.classList.remove('modal-open');
                            loginBtn.textContent = 'Account';
                            setTimeout(() => resetLoginModal(), 300);
                        });
                    } else {
                        // Registration Success - Auto Login
                        showStatusMessage(modal, 'Success', 'Registration Complete', 'success', 1500, () => {
                            if (data.user) {
                                localStorage.setItem('user', JSON.stringify(data.user));
                                if (loginBtn) loginBtn.textContent = 'Account';
                            }
                            modal.classList.remove('show-modal');
                            document.body.classList.remove('modal-open');
                            setTimeout(() => resetLoginModal(), 300);
                        });
                    }
                } else {
                    // Server returned an error (e.g., "User already exists")
                    showStatusMessage(modal, 'Error', data.message, 'error', 2000, () => {
                        // Restore form
                        const messageView = modal.querySelector('.modal-message-view');
                        if (messageView) messageView.remove();
                        const modalContent = modal.querySelector('.modal-content');
                        Array.from(modalContent.children).forEach(child => {
                            if (!child.classList.contains('modal-loading-overlay')) child.style.display = '';
                        });
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                showStatusMessage(modal, 'Error', 'Failed to connect to server.', 'error', 2000, () => resetLoginModal());
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

    const checkUsernameAvailability = async (username, feedbackElement, buttonElement, excludeId = null) => {
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
                checkUsernameAvailability(registerUsernameInput.value, registerUsernameFeedback, submitBtn, null);
            }, 500);
        });
    }

    // Email Validation Logic
    const validateEmail = (email, feedbackElement, buttonElement) => {
        // Only validate in Register mode
        if (isLoginMode) {
            if (feedbackElement) feedbackElement.textContent = '';
            if (buttonElement) {
                buttonElement.disabled = false;
                buttonElement.style.opacity = '1';
                buttonElement.style.cursor = 'pointer';
            }
            return;
        }

        // Ignore trailing spaces
        const trimmedEmail = email.replace(/\s+$/, '');
        
        if (!trimmedEmail) {
            if (feedbackElement) feedbackElement.textContent = '';
            return;
        }

        // Check for leading spaces or spaces in the middle
        if (trimmedEmail.startsWith(' ') || trimmedEmail.includes(' ')) {
            if (feedbackElement) {
                feedbackElement.textContent = 'No spaces allowed';
                feedbackElement.style.color = '#e10600';
            }
            if (buttonElement) {
                buttonElement.disabled = true;
                buttonElement.style.opacity = '0.5';
                buttonElement.style.cursor = 'not-allowed';
            }
            return;
        }

        // Email format check
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmedEmail)) {
            if (feedbackElement) {
                feedbackElement.textContent = 'Invalid email format';
                feedbackElement.style.color = '#e10600';
            }
            if (buttonElement) {
                buttonElement.disabled = true;
                buttonElement.style.opacity = '0.5';
                buttonElement.style.cursor = 'not-allowed';
            }
        } else {
            if (feedbackElement) {
                feedbackElement.textContent = '';
            }
            if (buttonElement) {
                buttonElement.disabled = false;
                buttonElement.style.opacity = '1';
                buttonElement.style.cursor = 'pointer';
            }
        }
    };

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            if (!isLoginMode && emailFeedback) {
                emailFeedback.textContent = '...';
                emailFeedback.style.color = '#ccc';
            }
            debounce(() => {
                validateEmail(emailInput.value, emailFeedback, submitBtn);
            }, 500);
        });
    }

    // --- Account Modal Actions ---

    // Logout Logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showStatusMessage(accountModal, 'Success', 'Logout Successful', 'success', 1500, () => {
                localStorage.removeItem('user');
                loginBtn.textContent = 'Login';
                accountModal.classList.remove('show-modal');
                document.body.classList.remove('modal-open');
                window.location.reload();
            });
        });
    }

    // Delete Account Logic
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            showConfirmation(accountModal, 'Delete Account', 'Are you sure you want to delete your account? This action cannot be undone.', async () => {
                // On Confirm
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.id) return;

                try {
                    // Show loading state implicitly via transition or explicit loading message
                    // We can reuse showStatusMessage but with no timeout to act as a loader
                    // But animateModalTransition handles the loader.
                    
                    const response = await fetch('http://localhost:5000/delete-account', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: user.id })
                    });

                    if (response.ok) {
                        showStatusMessage(accountModal, 'Deleted', 'Account Deleted', 'success', 1500, () => {
                            localStorage.removeItem('user');
                            window.location.reload();
                        });
                    } else {
                        const data = await response.json();
                        showStatusMessage(accountModal, 'Error', data.message || 'Failed to delete', 'error', 2000, () => resetChangeUsernameSection());
                    }
                } catch (error) {
                    console.error('Error deleting account:', error);
                    showStatusMessage(accountModal, 'Error', 'Server error', 'error', 2000, () => resetChangeUsernameSection());
                }
            }, () => {
                // On Cancel: Restore original view
                animateModalTransition(accountModal, (modalContent) => {
                    const messageView = modalContent.querySelector('.modal-message-view');
                    if (messageView) messageView.remove();
                    Array.from(modalContent.children).forEach(child => {
                        if (!child.classList.contains('modal-loading-overlay')) child.style.display = '';
                    });
                });
            });
        });
    }

    // Change Username Logic
    if (changeUsernameBtn) {
        changeUsernameBtn.addEventListener('click', () => {
            animateModalTransition(accountModal, () => {
                changeUsernameForm.classList.add('show');
                changeUsernameBtn.style.display = 'none';
            });
        });
    }

    if (cancelUsernameBtn) {
        cancelUsernameBtn.addEventListener('click', () => {
            animateModalTransition(accountModal, () => {
                resetChangeUsernameSection();
            });
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
                showStatusMessage(accountModal, 'Error', 'Spaces are not allowed in username.', 'error', 2000, () => resetChangeUsernameSection());
                return;
            }
            if (!/^[a-zA-Z0-9]+$/.test(newUsername)) {
                showStatusMessage(accountModal, 'Error', 'Username must not contain special characters.', 'error', 2000, () => resetChangeUsernameSection());
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
                    showStatusMessage(accountModal, 'Success', 'Username Updated', 'success', 1500, () => {
                        // Update local storage with new username
                        localStorage.setItem('user', JSON.stringify(data.user));
                        updateAccountTitle(data.user);
                        resetChangeUsernameSection();
                    });
                } else {
                    showStatusMessage(accountModal, 'Error', data.message, 'error', 2000, () => resetChangeUsernameSection());
                }
            } catch (error) {
                console.error('Error changing username:', error);
            }
        });
    }

    // Expose helpers for other scripts (e.g., heropage.js feedback form)
    window.f1Auth = {
        showStatusMessage,
        resetLoginModal
    };

    // --- Admin Panel Logic ---
    const openAdminPanel = () => {
        // Create Modal HTML if not exists
        let adminModal = document.getElementById('admin-modal');
        if (!adminModal) {
            adminModal = document.createElement('div');
            adminModal.id = 'admin-modal';
            adminModal.className = 'modal';
            adminModal.innerHTML = `
                <div class="modal-content admin-modal-content">
                    <div class="admin-header">
                        <h2>Admin Panel</h2>
                        <span class="close-btn" id="close-admin-btn">&times;</span>
                    </div>
                    <div class="admin-body">
                        <div class="admin-sidebar">
                            <button class="admin-tab-btn active" data-tab="feedback">Feedback</button>
                            <button class="admin-tab-btn" data-tab="featured">Featured Race</button>
                            <button class="admin-tab-btn" data-tab="spotlights">Spotlights</button>
                        </div>
                        <div class="admin-content-area" id="admin-content">
                            <!-- Content injected here -->
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(adminModal);

            // Close Logic
            adminModal.querySelector('#close-admin-btn').addEventListener('click', () => {
                adminModal.classList.remove('show-modal');
                document.body.classList.remove('modal-open');
            });

            // Close Logic (Click Outside)
            adminModal.addEventListener('click', (e) => {
                if (e.target === adminModal && mouseDownTarget === adminModal) {
                    adminModal.classList.remove('show-modal');
                    document.body.classList.remove('modal-open');
                }
            });

            // Tab Logic
            const tabs = adminModal.querySelectorAll('.admin-tab-btn');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    loadAdminTab(tab.dataset.tab);
                });
            });
        }

        adminModal.classList.add('show-modal');
        document.body.classList.add('modal-open');
        loadAdminTab('feedback'); // Default tab
    };

    const loadAdminTab = async (tabName) => {
        const container = document.getElementById('admin-content');
        
        container.style.opacity = '0';
        container.style.transform = 'translateY(10px)';

        try {
            if (tabName === 'feedback') {
                const res = await fetch('http://localhost:5000/admin/feedback');
                const feedback = await res.json();
                
                let html = '<h3>Feedback Moderation</h3><div class="admin-item-list">';
                if (feedback.length === 0) html += '<p>No feedback found.</p>';
                
                feedback.forEach(item => {
                    html += `
                        <div class="admin-item">
                            <div>
                                <strong>${item.email}</strong> <small>(${new Date(item.date).toLocaleDateString()})</small>
                                <p>${item.feedback}</p>
                            </div>
                            <button class="account-btn btn-red" style="width: auto; padding: 0.5rem 1rem;" onclick="deleteFeedback('${item._id}')">Delete</button>
                        </div>
                    `;
                });
                html += '</div>';
                container.innerHTML = html;

                // Attach delete handlers
                window.deleteFeedback = async (id) => {
                    if(confirm('Delete this feedback?')) {
                        await fetch(`http://localhost:5000/admin/feedback/${id}`, { method: 'DELETE' });
                        loadAdminTab('feedback');
                    }
                };

            } else if (tabName === 'featured') {
                const res = await fetch('http://localhost:5000/content/featured');
                const race = await res.json();

                let entriesHtml = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">';
                for (let i = 1; i <= 5; i++) {
                    entriesHtml += `
                        <div style="border: 1px solid #444; padding: 1rem; border-radius: 4px;">
                            <h4 style="margin-top: 0; margin-bottom: 0.5rem; color: #e10600;">Featured ${i}</h4>
                            <label>Header (Pink Text)</label>
                            <input type="text" name="entry_${i}_header" placeholder="${race[`entry_${i}_header`] || 'Input Header'}">
                            <label>Text</label>
                            <input type="text" name="entry_${i}_text" placeholder="${race[`entry_${i}_text`] || 'Input Text'}">
                            <label>Image URL</label>
                            <input type="text" name="entry_${i}_image" placeholder="${race[`entry_${i}_image`] || 'Input Image URL'}">
                        </div>
                    `;
                }
                entriesHtml += '</div>';

                container.innerHTML = `
                    <h3 style="color: #e10600;">Hero Section</h3>
                    <form class="admin-form" id="featured-form">
                        <label>Title</label>
                        <input type="text" name="title" placeholder="${race.title || 'Current Title'}">
                        <label>Description</label>
                        <textarea name="description" rows="4" placeholder="${race.description || 'Current Description'}"></textarea>
                        <label>Image URL</label>
                        <input type="text" name="imageUrl" placeholder="${race.imageUrl || 'Input Image URL'}">
                        ${entriesHtml}
                        <div style="display:flex; gap:1rem; margin-top: 1rem;">
                            <button type="submit" class="account-btn btn-red">Save Featured Race</button>
                            <button type="button" id="reset-featured-btn" class="account-btn btn-white">Reset to Default</button>
                        </div>
                    </form>
                `;

                document.getElementById('featured-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const formProps = Object.fromEntries(formData.entries());

                    // Merge with existing data: only update fields that are filled
                    const data = { ...race };
                    delete data._id; // Remove internal fields
                    delete data.__v;

                    for (const [key, value] of Object.entries(formProps)) {
                        if (value && value.trim() !== '') {
                            data[key] = value.trim();
                        }
                    }

                    await fetch('http://localhost:5000/content/featured', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    alert('Saved!');
                    loadAdminTab('featured'); // Refresh to update placeholders
                });

                document.getElementById('reset-featured-btn').addEventListener('click', () => {
                    const adminModal = document.getElementById('admin-modal');

                    showConfirmation(adminModal, 'Reset Content', 'Are you sure you want to reset the featured race to default values?', async () => {
                        const restoreView = () => {
                            animateModalTransition(adminModal, (modalContent) => {
                                modalContent.classList.remove('compact-view');
                                const messageViews = modalContent.querySelectorAll('.modal-message-view');
                                messageViews.forEach(v => v.remove());
                                Array.from(modalContent.children).forEach(child => {
                                    if (!child.classList.contains('modal-loading-overlay')) {
                                        child.style.display = '';
                                    }
                                });
                                loadAdminTab('featured');
                            });
                        };

                        try {
                            const res = await fetch('http://localhost:5000/content/featured/reset', {
                                method: 'POST'
                            });
                            const data = await res.json();
                            if (res.ok) {
                                showStatusMessage(adminModal, 'Success', data.message, 'success', 1500, restoreView);
                            } else {
                                showStatusMessage(adminModal, 'Error', data.message || 'Failed to reset', 'error', 2000, restoreView);
                            }
                        } catch (error) {
                            console.error('Error resetting featured race:', error);
                            showStatusMessage(adminModal, 'Error', 'Error connecting to server.', 'error', 2000, restoreView);
                        }
                    }, () => {
                        // On Cancel: Restore original view
                        animateModalTransition(adminModal, (modalContent) => {
                            modalContent.classList.remove('compact-view');
                            const messageView = modalContent.querySelector('.modal-message-view');
                            if (messageView) messageView.remove();
                            Array.from(modalContent.children).forEach(child => {
                                if (!child.classList.contains('modal-loading-overlay')) child.style.display = '';
                            });
                        });
                    });
                });

            } else if (tabName === 'spotlights') {
                const res = await fetch('http://localhost:5000/content/spotlights');
                const spotlights = await res.json();

                let html = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                        <h3>Manage Spotlights</h3>
                        <button class="account-btn btn-white" style="width:auto;" onclick="renderSpotlightForm()">+ Add New</button>
                    </div>
                    <div class="admin-item-list">
                `;

                spotlights.forEach(item => {
                    html += `
                        <div class="admin-item">
                            <div style="display:flex; gap:1rem; align-items:center;">
                                <img src="${item.imageUrl}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
                                <div><strong>${item.title}</strong></div>
                            </div>
                            <button class="account-btn btn-white" style="width: auto; padding: 0.5rem 1rem;" onclick='renderSpotlightForm(${JSON.stringify(item).replace(/'/g, "&apos;")})'>Edit</button>
                        </div>
                    `;
                });
                html += '</div>';
                container.innerHTML = html;

                window.renderSpotlightForm = (item = null) => {
                    const isEdit = !!item;
                    container.innerHTML = `
                        <h3>${isEdit ? 'Edit' : 'Create'} Spotlight</h3>
                        <form class="admin-form" id="spotlight-form">
                            <label>Title</label>
                            <input type="text" name="title" value="${item ? item.title : ''}" required>
                            <label>Description</label>
                            <textarea name="description" rows="4" required>${item ? item.description : ''}</textarea>
                            <label>Image URL</label>
                            <input type="text" name="imageUrl" value="${item ? item.imageUrl : ''}" required>
                            <div style="display:flex; gap:1rem;">
                                <button type="submit" class="account-btn btn-red">Save</button>
                                <button type="button" class="account-btn btn-white" onclick="loadAdminTab('spotlights')">Cancel</button>
                            </div>
                        </form>
                    `;

                    document.getElementById('spotlight-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const data = Object.fromEntries(formData.entries());
                        
                        const url = isEdit 
                            ? `http://localhost:5000/content/spotlights/${item._id}`
                            : 'http://localhost:5000/content/spotlights';
                        const method = isEdit ? 'PUT' : 'POST';

                        await fetch(url, {
                            method: method,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        loadAdminTab('spotlights');
                    });
                };
            }

            requestAnimationFrame(() => {
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            });
        } catch (error) {
            container.innerHTML = `<p style="color:red">Error loading data: ${error.message}</p>`;
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }
    };
});
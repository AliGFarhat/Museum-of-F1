document.addEventListener('DOMContentLoaded', () => {
    // Get all the elements we need from the HTML
    const els = {
        loginBtn: document.getElementById('login-register-btn'),
        modal: document.getElementById('login-modal'),
        closeBtn: document.getElementById('close-modal-btn'),
        authForm: document.getElementById('login-form'),
        modalTitle: document.getElementById('modalTitle'),
        submitBtn: document.getElementById('submitBtn'),
        toggleText: document.getElementById('toggleText'),
        toggleAction: document.getElementById('toggleAction'),
        emailInput: document.getElementById('email'),
        emailLabel: document.getElementById('email-label'),
        registerUsernameContainer: document.getElementById('register-username-container'),
        registerUsernameInput: document.getElementById('register-username'),
        registerUsernameFeedback: document.getElementById('register-username-feedback'),
        passwordInput: document.getElementById('password'),
        togglePassword: document.getElementById('togglePassword'),
        accountModal: document.getElementById('account-modal'),
        closeAccountBtn: document.getElementById('close-account-modal-btn'),
        accountModalTitle: document.getElementById('accountModalTitle'),
        logoutBtn: document.getElementById('logout-btn'),
        deleteAccountBtn: document.getElementById('delete-account-btn'),
        changeUsernameBtn: document.getElementById('change-username-btn'),
        changeUsernameForm: document.getElementById('change-username-form'),
        newUsernameInput: document.getElementById('new-username-input'),
        changeUsernameFeedback: document.getElementById('change-username-feedback'),
        saveUsernameBtn: document.getElementById('save-username-btn'),
        cancelUsernameBtn: document.getElementById('cancel-username-btn')
    };
    
    // Create the email feedback text if it's not there
    const emailFeedback = document.getElementById('email-feedback') || (() => {
        if (els.emailInput) {
            const el = document.createElement('div');
            el.id = 'email-feedback';
            el.className = 'validation-text';
            els.emailInput.insertAdjacentElement('afterend', el);
            return el;
        }
        return null;
    })();

    // Helper functions
    const updateAccountTitle = (user) => {
        if (els.accountModalTitle && user && user.username) {
            els.accountModalTitle.innerHTML = `Hello, ${user.username}`;
            if (user.isAdmin) {
                const badge = document.createElement('span');
                badge.className = 'admin-badge';
                badge.textContent = 'ADMIN';
                els.accountModalTitle.appendChild(badge);

                // Inject Admin Panel Button if not exists
                if (document.querySelector('.hero-section') && !document.getElementById('open-admin-panel-btn')) {
                    const adminBtn = document.createElement('button');
                    adminBtn.id = 'open-admin-panel-btn';
                    adminBtn.className = 'account-btn btn-outline-red';
                    adminBtn.textContent = 'Open Admin Panel';
                    adminBtn.style.marginTop = '1rem';
                    adminBtn.addEventListener('click', () => {
                        els.accountModal.classList.remove('show-modal');
                        openAdminPanel();
                    });
                    els.logoutBtn.parentNode.insertBefore(adminBtn, els.logoutBtn);
                }
            }
        }
    };

    let isLoginMode = true;

    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser && els.loginBtn) {
        els.loginBtn.textContent = 'Account';
    }

    // Handle the login/account button click
    if (els.loginBtn) {
        els.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (localStorage.getItem('user')) {
                // User is logged in, open Account Modal
                if (els.accountModal) {
                    // Update modal title with username
                    const user = JSON.parse(localStorage.getItem('user'));
                    updateAccountTitle(user);
                    els.accountModal.classList.add('show-modal');
                    document.body.classList.add('modal-open');

                    // Ensure login modal is closed (fixes conflict with heropage.js)
                    if (els.modal) els.modal.classList.remove('show-modal');
                }
            } else {
                // User is not logged in, open Modal
                if (els.modal) els.modal.classList.add('show-modal');
                document.body.classList.add('modal-open');
            }
        });
    }

    const resetLoginModal = () => {
        if (els.emailInput) els.emailInput.value = '';
        if (els.passwordInput) {
            els.passwordInput.value = '';
            els.passwordInput.setAttribute('type', 'password');
        }
        if (els.registerUsernameInput) els.registerUsernameInput.value = '';
        if (els.registerUsernameFeedback) els.registerUsernameFeedback.textContent = '';
        if (emailFeedback) emailFeedback.textContent = '';
        
        // Reset password toggle
        if (els.togglePassword) {
            els.togglePassword.style.display = 'none';
            els.togglePassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
        }

        // Go back to login mode
        isLoginMode = true;
        if (els.modalTitle) els.modalTitle.textContent = 'Login';
        if (els.submitBtn) {
            els.submitBtn.textContent = 'Login';
            els.submitBtn.disabled = false;
            els.submitBtn.style.opacity = '1';
            els.submitBtn.style.cursor = 'pointer';
        }
        if (els.toggleText) els.toggleText.textContent = "Don't have an account? ";
        if (els.toggleAction) els.toggleAction.textContent = "Register";
        if (els.registerUsernameContainer) els.registerUsernameContainer.style.display = 'none';
        if (els.emailLabel) els.emailLabel.textContent = 'Email / Username';
        if (els.registerUsernameInput) els.registerUsernameInput.required = false;

        // Remove any messages
        if (els.modal) {
            const messageViews = els.modal.querySelectorAll('.modal-message-view');
            messageViews.forEach(view => view.remove());
            const modalContent = els.modal.querySelector('.modal-content');
            if (modalContent) {
                Array.from(modalContent.children).forEach(child => {
                    if (!child.classList.contains('modal-loading-overlay')) {
                        child.style.display = '';
                    }
                });
            }
        }

        // Hide the loader
        if (els.modal) {
            const loaderOverlay = els.modal.querySelector('.modal-loading-overlay');
            if (loaderOverlay) loaderOverlay.classList.remove('show');
        }
    };

    // Close modal when clicking X
    if (els.closeBtn) {
        els.closeBtn.addEventListener('click', () => {
            els.modal.classList.remove('show-modal');
            document.body.classList.remove('modal-open');
            setTimeout(() => resetLoginModal(), 300);
        });
    }

    const resetChangeUsernameSection = () => {
        if (els.changeUsernameForm) els.changeUsernameForm.classList.remove('show');
        if (els.changeUsernameBtn) els.changeUsernameBtn.style.display = 'block';
        if (els.newUsernameInput) els.newUsernameInput.value = '';
        if (els.changeUsernameFeedback) els.changeUsernameFeedback.textContent = '';
        
        // Reset any custom message views in account modal
        if (els.accountModal) {
            const messageViews = els.accountModal.querySelectorAll('.modal-message-view');
            messageViews.forEach(view => view.remove());
            const modalContent = els.accountModal.querySelector('.modal-content');
            if (modalContent) {
                Array.from(modalContent.children).forEach(child => {
                    if (!child.classList.contains('modal-loading-overlay')) {
                        child.style.display = '';
                    }
                });
            }
        }
    };

    // Close account modal when clicking X
    if (els.closeAccountBtn) {
        els.closeAccountBtn.addEventListener('click', () => {
            els.accountModal.classList.remove('show-modal');
            document.body.classList.remove('modal-open');
            resetChangeUsernameSection();
        });
    }

    let mouseDownTarget = null;
    window.addEventListener('mousedown', (e) => {
        mouseDownTarget = e.target;
    });

    // Close modal if clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === els.modal && mouseDownTarget === els.modal) {
            els.modal.classList.remove('show-modal');
            document.body.classList.remove('modal-open');
            setTimeout(() => resetLoginModal(), 300);
        }
        if (e.target === els.accountModal && mouseDownTarget === els.accountModal) {
            els.accountModal.classList.remove('show-modal');
            document.body.classList.remove('modal-open');
            resetChangeUsernameSection();
        }
    });

    // Functions for modal animations and messages
    const animateModalTransition = (modal, updateContentFn, callback) => {
        const modalContent = modal.querySelector('.modal-content');
        
        const startHeight = modalContent.offsetHeight;
        const startWidth = modalContent.offsetWidth;
        modalContent.style.height = `${startHeight}px`;
        modalContent.style.width = `${startWidth}px`;
        modalContent.style.overflow = 'hidden';

        let loaderOverlay = modal.querySelector('.modal-loading-overlay');
        if (!loaderOverlay) {
            loaderOverlay = document.createElement('div');
            loaderOverlay.className = 'modal-loading-overlay';
            loaderOverlay.innerHTML = '<div class="loader"></div>';
            modalContent.appendChild(loaderOverlay);
        }
        loaderOverlay.classList.add('show');

        setTimeout(() => {
            updateContentFn(modalContent);

            modalContent.style.transition = 'none';
            modalContent.style.height = 'auto';
            modalContent.style.width = ''; // Reset width to allow CSS to dictate it
            const targetHeight = modalContent.offsetHeight;
            const targetWidth = modalContent.offsetWidth;

            modalContent.style.height = `${startHeight}px`;
            modalContent.style.width = `${startWidth}px`;
            modalContent.offsetHeight; // Force reflow

            modalContent.style.transition = 'all 0.3s ease';
            modalContent.style.height = `${targetHeight}px`;
            modalContent.style.width = `${targetWidth}px`;

            setTimeout(() => {
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
            Array.from(modalContent.children).forEach(child => {
                if (!child.classList.contains('modal-loading-overlay')) child.style.display = 'none';
            });

            if (modalContent.classList.contains('admin-modal-content')) {
                modalContent.classList.add('compact-view');
            }

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

    const showSeparateConfirmationModal = (title, message, onConfirm) => {
        const confirmModal = document.createElement('div');
        confirmModal.className = 'modal'; // Start hidden for animation
        confirmModal.style.zIndex = '2000'; // Ensure it sits above other modals
        
        confirmModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <h2 style="margin-bottom: 1rem; font-family: 'Formula Font';">${title}</h2>
                <p>${message}</p>
                <div class="modal-btn-group">
                    <button id="sep-confirm-yes" class="account-btn btn-red">Yes</button>
                    <button id="sep-confirm-no" class="account-btn btn-white">No</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmModal);
        
        requestAnimationFrame(() => {
            confirmModal.classList.add('show-modal');
        });
        
        const close = () => {
            confirmModal.classList.remove('show-modal');
            setTimeout(() => {
                confirmModal.remove();
                if (!document.querySelector('.modal.show-modal')) {
                    document.body.classList.remove('modal-open');
                }
            }, 300); // Wait for transition
        };

        confirmModal.querySelector('#sep-confirm-yes').addEventListener('click', () => {
            onConfirm();
            close();
        });

        confirmModal.querySelector('#sep-confirm-no').addEventListener('click', () => {
            close();
        });

        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                close();
            }
        });
    };

    // Switch between Login and Register
    if (els.toggleAction) {
        els.toggleAction.addEventListener('click', (e) => {
            e.preventDefault();
            
            const modalContent = els.modal.querySelector('.modal-content');
            
            const startHeight = modalContent.offsetHeight;
            modalContent.style.height = `${startHeight}px`;
            modalContent.style.overflow = 'hidden';

            let loaderOverlay = els.modal.querySelector('.modal-loading-overlay');
            if (!loaderOverlay) {
                if (modalContent) {
                    loaderOverlay = document.createElement('div');
                    loaderOverlay.className = 'modal-loading-overlay';
                    loaderOverlay.innerHTML = '<div class="loader"></div>';
                    modalContent.appendChild(loaderOverlay);
                }
            }

            if (loaderOverlay) loaderOverlay.classList.add('show');

            requestAnimationFrame(() => {
                isLoginMode = !isLoginMode;
                
                if (isLoginMode) {
                    els.modalTitle.textContent = 'Login';
                    els.submitBtn.textContent = 'Login';
                    els.toggleText.textContent = "Don't have an account? ";
                    els.toggleAction.textContent = "Register";
                    els.registerUsernameContainer.style.display = 'none';
                    els.emailLabel.textContent = 'Email / Username';
                    els.registerUsernameInput.required = false;
                    els.registerUsernameInput.value = '';
                    els.registerUsernameFeedback.textContent = '';
                    if (emailFeedback) emailFeedback.textContent = '';
                    els.submitBtn.disabled = false;
                    els.submitBtn.style.opacity = '1';
                    els.submitBtn.style.cursor = 'pointer';
                } else {
                    els.modalTitle.textContent = 'Register';
                    els.submitBtn.textContent = 'Register';
                    els.toggleText.textContent = "Already have an account? ";
                    els.toggleAction.textContent = "Login";
                    els.registerUsernameContainer.style.display = 'block';
                    els.emailLabel.textContent = 'Email';
                    els.registerUsernameInput.required = true;
                    if (emailFeedback) emailFeedback.textContent = '';
                }

                modalContent.style.transition = 'none';
                modalContent.style.height = 'auto';
                const targetHeight = modalContent.offsetHeight;

                modalContent.style.height = `${startHeight}px`;
                modalContent.offsetHeight;

                modalContent.style.transition = 'all 0.3s ease';
                modalContent.style.height = `${targetHeight}px`;

                setTimeout(() => {
                    if (loaderOverlay) loaderOverlay.classList.remove('show');

                    modalContent.style.height = 'auto';
                    modalContent.style.overflow = '';
                    modalContent.style.transition = '';
                }, 500);
            });
        });
    }

    // Handle form submit
    if (els.authForm) {
        els.authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = els.emailInput.value.trim();
            const password = els.passwordInput.value.trim();
            const username = els.registerUsernameInput.value.trim();

            if (email.includes(' ') || password.includes(' ')) {
                showStatusMessage(els.modal, 'Error', 'Spaces are not allowed in email or password.', 'error', 2000, () => resetLoginModal());
                return;
            }

            if (!isLoginMode) {
                if (username.includes(' ')) {
                    showStatusMessage(els.modal, 'Error', 'Spaces are not allowed in username.', 'error', 2000, () => resetLoginModal());
                    return;
                }
                if (!/^[a-zA-Z0-9]+$/.test(username)) {
                    showStatusMessage(els.modal, 'Error', 'Username must not contain special characters.', 'error', 2000, () => resetLoginModal());
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
                        showStatusMessage(els.modal, 'Success', 'Login Successful', 'success', 1500, () => {
                            localStorage.setItem('user', JSON.stringify(data.user));
                            els.modal.classList.remove('show-modal');
                            document.body.classList.remove('modal-open');
                            els.loginBtn.textContent = 'Account';
                            setTimeout(() => resetLoginModal(), 300);
                        });
                    } else {
                        // Registration Success - Auto Login
                        showStatusMessage(els.modal, 'Success', 'Registration Complete', 'success', 1500, () => {
                            if (data.user) {
                                localStorage.setItem('user', JSON.stringify(data.user));
                                if (els.loginBtn) els.loginBtn.textContent = 'Account';
                            }
                            els.modal.classList.remove('show-modal');
                            document.body.classList.remove('modal-open');
                            setTimeout(() => resetLoginModal(), 300);
                        });
                    }
                } else {
                    // Server returned an error (e.g., "User already exists")
                    showStatusMessage(els.modal, 'Error', data.message, 'error', 2000, () => {
                        // Restore form
                        const messageView = els.modal.querySelector('.modal-message-view');
                        if (messageView) messageView.remove();
                        const modalContent = els.modal.querySelector('.modal-content');
                        Array.from(modalContent.children).forEach(child => {
                            if (!child.classList.contains('modal-loading-overlay')) child.style.display = '';
                        });
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                showStatusMessage(els.modal, 'Error', 'Failed to connect to server.', 'error', 2000, () => resetLoginModal());
            }
        });
    }

    // Show/Hide password logic
    if (els.passwordInput && els.togglePassword) {
        // Show/Hide icon based on input value
        els.passwordInput.addEventListener('input', () => {
            if (els.passwordInput.value.length > 0) {
                els.togglePassword.style.display = 'block';
            } else {
                els.togglePassword.style.display = 'none';
            }
        });

        // Toggle Password Type and Icon
        els.togglePassword.addEventListener('click', () => {
            const type = els.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            els.passwordInput.setAttribute('type', type);
            
            if (type === 'text') {
                // Show Slash Eye (Red) - means "Click to Hide"
                els.togglePassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e10600"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`;
            } else {
                // Show Open Eye (White) - means "Click to Reveal"
                els.togglePassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
            }
        });
    }

    // Check if username is taken
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

    if (els.registerUsernameInput) {
        els.registerUsernameInput.addEventListener('input', () => {
            els.registerUsernameFeedback.textContent = '...';
            els.registerUsernameFeedback.style.color = '#ccc';
            debounce(() => {
                checkUsernameAvailability(els.registerUsernameInput.value, els.registerUsernameFeedback, els.submitBtn, null);
            }, 500);
        });
    }

    // Check if email is valid
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

    if (els.emailInput) {
        els.emailInput.addEventListener('input', () => {
            if (!isLoginMode && emailFeedback) {
                emailFeedback.textContent = '...';
                emailFeedback.style.color = '#ccc';
            }
            debounce(() => {
                validateEmail(els.emailInput.value, emailFeedback, els.submitBtn);
            }, 500);
        });
    }

    // Account actions

    // Handle logout
    if (els.logoutBtn) {
        els.logoutBtn.addEventListener('click', () => {
            showStatusMessage(els.accountModal, 'Success', 'Logout Successful', 'success', 1500, () => {
                localStorage.removeItem('user');
                els.loginBtn.textContent = 'Login';
                els.accountModal.classList.remove('show-modal');
                document.body.classList.remove('modal-open');
                window.location.reload();
            });
        });
    }

    // Handle delete account
    if (els.deleteAccountBtn) {
        els.deleteAccountBtn.addEventListener('click', async () => {
            showConfirmation(els.accountModal, 'Delete Account', 'Are you sure you want to delete your account? This action cannot be undone.', async () => {
                // On Confirm
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.id) return;

                try {
                    const response = await fetch('http://localhost:5000/delete-account', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: user.id })
                    });

                    if (response.ok) {
                        showStatusMessage(els.accountModal, 'Deleted', 'Account Deleted', 'success', 1500, () => {
                            localStorage.removeItem('user');
                            window.location.reload();
                        });
                    } else {
                        const data = await response.json();
                        showStatusMessage(els.accountModal, 'Error', data.message || 'Failed to delete', 'error', 2000, () => resetChangeUsernameSection());
                    }
                } catch (error) {
                    console.error('Error deleting account:', error);
                    showStatusMessage(els.accountModal, 'Error', 'Server error', 'error', 2000, () => resetChangeUsernameSection());
                }
            }, () => {
                // On Cancel: Restore original view
                animateModalTransition(els.accountModal, (modalContent) => {
                    const messageView = modalContent.querySelector('.modal-message-view');
                    if (messageView) messageView.remove();
                    Array.from(modalContent.children).forEach(child => {
                        if (!child.classList.contains('modal-loading-overlay')) child.style.display = '';
                    });
                });
            });
        });
    }

    // Handle changing username
    if (els.changeUsernameBtn) {
        els.changeUsernameBtn.addEventListener('click', () => {
            animateModalTransition(els.accountModal, () => {
                els.changeUsernameForm.classList.add('show');
                els.changeUsernameBtn.style.display = 'none';
            });
        });
    }

    if (els.cancelUsernameBtn) {
        els.cancelUsernameBtn.addEventListener('click', () => {
            animateModalTransition(els.accountModal, () => {
                resetChangeUsernameSection();
            });
        });
    }

    if (els.newUsernameInput) {
        els.newUsernameInput.addEventListener('input', () => {
            els.changeUsernameFeedback.textContent = '...';
            els.changeUsernameFeedback.style.color = '#ccc';
            debounce(() => {
                checkUsernameAvailability(els.newUsernameInput.value, els.changeUsernameFeedback, els.saveUsernameBtn);
            }, 500);
        });
    }

    if (els.saveUsernameBtn) {
        els.saveUsernameBtn.addEventListener('click', async () => {
            const newUsername = els.newUsernameInput.value.trim();
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!newUsername || !user || !user.id) return;

            if (newUsername.includes(' ')) {
                showStatusMessage(els.accountModal, 'Error', 'Spaces are not allowed in username.', 'error', 2000, () => resetChangeUsernameSection());
                return;
            }
            if (!/^[a-zA-Z0-9]+$/.test(newUsername)) {
                showStatusMessage(els.accountModal, 'Error', 'Username must not contain special characters.', 'error', 2000, () => resetChangeUsernameSection());
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
                    showStatusMessage(els.accountModal, 'Success', 'Username Updated', 'success', 1500, () => {
                        // Update local storage with new username
                        localStorage.setItem('user', JSON.stringify(data.user));
                        updateAccountTitle(data.user);
                        resetChangeUsernameSection();
                    });
                } else {
                    showStatusMessage(els.accountModal, 'Error', data.message, 'error', 2000, () => resetChangeUsernameSection());
                }
            } catch (error) {
                console.error('Error changing username:', error);
            }
        });
    }

    // Make these functions available to other scripts
    window.f1Auth = {
        showStatusMessage,
        resetLoginModal
    };

    // Admin panel code
    const createImgInput = (name, value, placeholder) => `
        <div class="input-with-icon">
            <input type="text" name="${name}" value="${value || ''}" placeholder="${placeholder}" class="image-url-input" id="input-${name}">
            <input type="file" accept="image/*" class="hidden-file-input" id="file-${name}" style="display: none;">
            <button type="button" class="icon-btn upload-btn" data-target="${name}" title="Upload Image">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </button>
        </div>
    `;

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

        // Reset sidebar active state to feedback
        const tabs = adminModal.querySelectorAll('.admin-tab-btn');
        tabs.forEach(t => {
            if (t.dataset.tab === 'feedback') {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        requestAnimationFrame(() => {
            adminModal.classList.add('show-modal');
            document.body.classList.add('modal-open');
        });
        loadAdminTab('feedback'); // Default tab
    };

    const loadAdminTab = async (tabName) => {
        const container = document.getElementById('admin-content');
        
        container.style.opacity = '0';
        container.style.transform = 'translateY(10px)';

        // Wait for transition to complete
        await new Promise(resolve => setTimeout(resolve, 200));

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
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                                <h4 style="margin: 0; color: #e10600;">Featured ${i}</h4>
                                <button type="button" class="account-btn btn-white undo-btn" onclick="resetSection('featured_${i}')" title="Reset this entry">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
                                </button>
                            </div>
                            <label>Header (Pink Text)</label>
                            <input type="text" name="entry_${i}_header" placeholder="${race[`entry_${i}_header`] || 'Input Header'}">
                            <label>Text</label>
                            <input type="text" name="entry_${i}_text" placeholder="${race[`entry_${i}_text`] || 'Input Text'}">
                            <label>Image URL</label>
                            ${createImgInput(`entry_${i}_image`, race[`entry_${i}_image`], race[`entry_${i}_image`] || 'Input Image URL')}
                        </div>
                    `;
                }
                entriesHtml += '</div>';

                container.innerHTML = `
                    <div style="display:flex; align-items:center; margin-bottom: 1rem;">
                        <h3 style="color: #e10600; margin:0;">Hero Section</h3>
                        <button type="button" class="account-btn btn-white undo-btn" onclick="resetSection('hero')" title="Reset Hero Section">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
                        </button>
                    </div>
                    <form class="admin-form" id="featured-form">
                        <label>Title</label>
                        <input type="text" name="title" placeholder="${race.title || 'Input Title'}">
                        <label>Description</label>
                        <textarea name="description" rows="4" placeholder="${race.description || 'Input Description'}"></textarea>
                        <label>Image URL</label>
                        ${createImgInput('imageUrl', race.imageUrl, race.imageUrl || 'Input Image URL')}
                        ${entriesHtml}
                        <div style="display:flex; gap:1rem; margin-top: 1rem;">
                            <button type="submit" class="account-btn btn-red">Save Featured Race</button>
                            <button type="button" id="reset-featured-btn" class="account-btn btn-white">Reset to Default</button>
                        </div>
                    </form>
                `;

                // Handle File Uploads
                container.querySelectorAll('.upload-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const targetName = btn.dataset.target;
                        document.getElementById(`file-${targetName}`).click();
                    });
                });

                container.querySelectorAll('.hidden-file-input').forEach(input => {
                    input.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                                const textInput = document.getElementById(`input-${input.id.replace('file-', '')}`);
                                textInput.value = ev.target.result; // Set Base64 string
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                });

                document.getElementById('featured-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const formProps = Object.fromEntries(formData.entries());

                    // Merge with existing data: only update fields that are filled
                    const data = { ...race };
                    delete data._id; // Remove internal fields
                    delete data.__v;
                    delete data.updatedAt;

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
                    
                    const adminModal = document.getElementById('admin-modal');
                    showStatusMessage(adminModal, 'Success', 'Featured Race Updated', 'success', 1500, () => {
                        window.location.reload();
                    });
                });

                // Reset Section Logic
                window.resetSection = async (section) => {
                    showSeparateConfirmationModal(
                        'Reset Section',
                        `Are you sure you want to reset ${section.replace('_', ' ')} to default?`,
                        async () => {
                            // Create a copy of current data
                            const data = { ...race };
                            delete data._id;
                            delete data.__v;
                            delete data.updatedAt;

                            if (section === 'hero') {
                                delete data.title;
                                delete data.description;
                                delete data.imageUrl;
                            } else if (section.startsWith('featured_')) {
                                const index = section.split('_')[1];
                                delete data[`entry_${index}_header`];
                                delete data[`entry_${index}_text`];
                                delete data[`entry_${index}_image`];
                            }

                            // Save the modified data (effectively removing the section's data)
                            await fetch('http://localhost:5000/content/featured', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                            });

                            window.location.reload();
                        }
                    );
                };

                document.getElementById('reset-featured-btn').addEventListener('click', () => {
                    const adminModal = document.getElementById('admin-modal');

                    showConfirmation(adminModal, 'Reset Content', 'Are you sure you want to reset the featured race to default values?', async () => {
                        const restoreView = () => {
                            window.location.reload();
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

                const spotlightLabels = [
                    "Top Row - Left (Large)",
                    "Top Row - Middle",
                    "Top Row - Right",
                    "Bottom Row - Left",
                    "Bottom Row - Middle",
                    "Bottom Row - Right (Large)"
                ];

                let entriesHtml = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">';
                for (let i = 1; i <= 6; i++) {
                    entriesHtml += `
                        <div style="border: 1px solid #444; padding: 1rem; border-radius: 4px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                                <div>
                                    <h4 style="margin: 0; color: #e10600;">Spotlight ${i}</h4>
                                    <small style="color: var(--color-text-grey); font-family: 'Titillium Web';">${spotlightLabels[i-1]}</small>
                                </div>
                                <button type="button" class="account-btn btn-white undo-btn" onclick="resetSection('spotlight_${i}')" title="Reset this entry">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
                                </button>
                            </div>
                            <label>Title</label>
                            <input type="text" name="spotlight_${i}_title" placeholder="${spotlights[`spotlight_${i}_title`] || 'Input Title'}">
                            <label>Image URL</label>
                            ${createImgInput(`spotlight_${i}_image`, spotlights[`spotlight_${i}_image`], spotlights[`spotlight_${i}_image`] || 'Input Image URL')}
                        </div>
                    `;
                }
                entriesHtml += '</div>';

                container.innerHTML = `
                    <h3>Manage Spotlights</h3>
                    <form class="admin-form" id="spotlights-form">
                        ${entriesHtml}
                        <div style="display:flex; gap:1rem; margin-top: 1rem;">
                            <button type="submit" class="account-btn btn-red">Save Spotlights</button>
                            <button type="button" id="reset-spotlights-btn" class="account-btn btn-white">Reset to Default</button>
                        </div>
                    </form>
                `;

                // Handle File Uploads
                container.querySelectorAll('.upload-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const targetName = btn.dataset.target;
                        document.getElementById(`file-${targetName}`).click();
                    });
                });

                container.querySelectorAll('.hidden-file-input').forEach(input => {
                    input.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                                const textInput = document.getElementById(`input-${input.id.replace('file-', '')}`);
                                textInput.value = ev.target.result;
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                });

                document.getElementById('spotlights-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const formProps = Object.fromEntries(formData.entries());

                    // Merge with existing data: only update fields that are filled
                    const data = { ...spotlights };
                    delete data._id;
                    delete data.__v;
                    delete data.updatedAt;

                    for (const [key, value] of Object.entries(formProps)) {
                        if (value && value.trim() !== '') {
                            data[key] = value.trim();
                        }
                    }

                    await fetch('http://localhost:5000/content/spotlights', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    const adminModal = document.getElementById('admin-modal');
                    showStatusMessage(adminModal, 'Success', 'Spotlights Updated', 'success', 1500, () => {
                        window.location.reload();
                    });
                });

                // Reset Section Logic for Spotlights
                window.resetSection = async (section) => {
                    if (section.startsWith('spotlight_')) {
                        showSeparateConfirmationModal(
                            'Reset Entry',
                            `Are you sure you want to reset ${section.replace('_', ' ')}?`,
                            async () => {
                                const data = { ...spotlights };
                                delete data._id;
                                delete data.__v;
                                delete data.updatedAt;

                                const index = section.split('_')[1];
                                delete data[`spotlight_${index}_title`];
                                delete data[`spotlight_${index}_image`];
                                delete data[`spotlight_${index}_text`];

                                await fetch('http://localhost:5000/content/spotlights', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(data)
                                });
                                window.location.reload();
                            }
                        );
                    }
                };

                document.getElementById('reset-spotlights-btn').addEventListener('click', () => {
                    const adminModal = document.getElementById('admin-modal');
                    showConfirmation(adminModal, 'Reset All', 'Are you sure you want to reset all spotlights?', async () => {
                        const restoreView = () => {
                            window.location.reload();
                        };

                        try {
                            const res = await fetch('http://localhost:5000/content/spotlights/reset', { method: 'POST' });
                            const data = await res.json();
                            if (res.ok) {
                                showStatusMessage(adminModal, 'Success', data.message, 'success', 1500, restoreView);
                            } else {
                                showStatusMessage(adminModal, 'Error', data.message || 'Failed to reset', 'error', 2000, restoreView);
                            }
                        } catch (error) {
                            console.error('Error resetting spotlights:', error);
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
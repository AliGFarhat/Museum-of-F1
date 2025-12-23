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
    const passwordInput = document.getElementById('password');

    let isLoginMode = true;

    // Check if user is already logged in (persisted session)
    const storedUser = localStorage.getItem('user');
    if (storedUser && loginBtn) {
        loginBtn.textContent = 'Logout';
    }

    // Handle Navbar Button Click (Login / Logout)
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (localStorage.getItem('user')) {
                // User is logged in, so this acts as Logout
                localStorage.removeItem('user');
                loginBtn.textContent = 'Login';
                alert('Logged out successfully');
                window.location.reload(); // Optional: reload page to reset state
            } else {
                // User is not logged in, open Modal
                if (modal) modal.style.display = 'block';
            }
        });
    }

    // Close Modal (X button)
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Close Modal (Click outside)
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
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
            } else {
                modalTitle.textContent = 'Register';
                submitBtn.textContent = 'Register';
                toggleText.textContent = "Already have an account? ";
                toggleAction.textContent = "Login";
            }
        });
    }

    // Handle Form Submission
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput.value;
            const password = passwordInput.value;
            const endpoint = isLoginMode ? '/login' : '/register';
            const url = `http://localhost:5000${endpoint}`;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    if (isLoginMode) {
                        // Login Success
                        localStorage.setItem('user', JSON.stringify(data.user));
                        modal.style.display = 'none';
                        loginBtn.textContent = 'Logout';
                        
                        // Clear inputs
                        emailInput.value = '';
                        passwordInput.value = '';
                    } else {
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
});
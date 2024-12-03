document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.createElement('p');
    errorMessage.style.color = 'red';
    errorMessage.id = 'error-message';
    loginForm.appendChild(errorMessage);

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    // Redirect to the specified page
                    window.location.href = result.redirect;
                } else {
                    // Display error message below the password field
                    errorMessage.textContent = result.message || 'Login failed.';
                }
            } catch (error) {
                console.error('Error during login:', error);
                errorMessage.textContent = 'An unexpected error occurred.';
            }
        });
    } else {
        console.error('Login form not found');
    }
});
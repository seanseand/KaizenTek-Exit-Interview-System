document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const loginType = document.getElementById('loginType').value;
    const form = this;

    // set the appropriate form action based on login type
    form.action = (loginType === 'student') ? 'entry_point/login.php' : '/api/login'; // Node.js API for admin

    // create FormData for the student login
    const formData = new FormData(form);
    let requestBody;

    if (loginType === 'admin') {
        // for admin login, convert form data to JSON
        requestBody = {};
        formData.forEach((value, key) => {
            requestBody[key] = value;
        });
    } else {
        // for student login, use the FormData as is (no conversion to JSON)
        requestBody = formData;
    }

    // perform AJAX request using fetch
    fetch(form.action, {
        method: 'POST',
        body: (loginType === 'admin') ? JSON.stringify(requestBody) : formData,  // use JSON for admin, FormData for student
        headers: (loginType === 'admin') ? { 'Content-Type': 'application/json' } : {}  // only set JSON content type for admin
    })
        .then(response => response.json())  // if the server responds with JSON
        .then(data => {
            if (data.success) {
                window.location.href = data.redirect.replace("\\", "/"); // correct path format
            } else {
                document.getElementById('error-message').textContent = data.message || "Login failed. Please try again.";
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            document.getElementById('error-message').textContent = "An error occurred. Please try again later.";
        });
});
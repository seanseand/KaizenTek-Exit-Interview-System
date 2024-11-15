document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    fetch(this.action, {
        method: this.method,
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = data.redirect;
            } else {
                document.getElementById('error-message').textContent = data.message;
            }
        })
        .catch(error => console.error('Error:', error));
});
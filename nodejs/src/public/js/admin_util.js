const hamBurger = document.querySelector("#toggle-btn");

hamBurger.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("expand");
});

document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    const uploadMessageElement = document.getElementById('uploadMessage');
    if (uploadMessageElement) {
        uploadMessageElement.innerText = result.message;
    }
});
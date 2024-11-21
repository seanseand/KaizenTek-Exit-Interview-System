// load questions based on selected sort option
function loadQuestions() {
    const sortOption = document.getElementById('sortOption').value;
    const xhr = new XMLHttpRequest();

admin_side/admin_phps/assets/js/admin_script.js
    xhr.open('GET', `../../src/questions/view_questions.php?sortOption=${sortOption}`, true);

    xhr.open('GET', `../admin_side/admin_phps/view_questions.php?sortOption=${sortOption}`, true);
admin_side/admin_scripts/admin_script.js
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById('questionsList').innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}

// load evaluations based on selected sort option
function loadEvaluations() {
    const sortOption = document.getElementById('evaluationSortOption').value;
    const xhr = new XMLHttpRequest();

admin_side/admin_phps/assets/js/admin_script.js
    xhr.open('GET', `../../src/evaluations/view_evaluations.php?sortOption=${sortOption}`, true);

    xhr.open('GET', `../admin_side/admin_phps/view_evaluations.php?sortOption=${sortOption}`, true);
admin_side/admin_scripts/admin_script.js
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById('evaluationsList').innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}

// check student responses for a specific Evaluation ID
function checkResponses() {
    const evaluationID = document.getElementById('evaluationIDInput').value;
    if (!evaluationID) {
        alert("Please enter an Evaluation ID.");
        return;
    }

    const xhr = new XMLHttpRequest();
admin_side/admin_phps/assets/js/admin_script.js
    xhr.open('GET', `../../src/evaluation/check_responses.php?evaluationID=${evaluationID}`, true);

    xhr.open('GET', `../admin_side/admin_phps/check_responses.php?evaluationID=${evaluationID}`, true);
admin_side/admin_scripts/admin_script.js
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            const response = JSON.parse(xhr.responseText);
            const responseStatusDiv = document.getElementById('responseStatus');

            if (response.error) {
                responseStatusDiv.innerHTML = `<p style="color:red;">${response.error}</p>`;
            } else if (response.status === "no_responses") {
                responseStatusDiv.innerHTML = `<p>${response.message}</p>`;
            } else {
                // display the list of students who responded
                let studentList = "<h3>Student/s who responded:</h3><ol>";
                response.students.forEach(studentID => {
                    studentList += `<li>Student ID: ${studentID}</li>`;
                });
                studentList += "</ol>";
                responseStatusDiv.innerHTML = studentList;
            }
        }
    };
    xhr.send();
}

document.addEventListener('DOMContentLoaded', function () {
    fetch('../admin_side/admin_phps/get_username.php')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                document.getElementById('usernameDisplay').textContent = data.username;
            } else {
                console.error('Error:', data.error);
            }
        })
        .catch(error => console.error('Error fetching username:', error));
});

// execute on page load
window.onload = function () {
    loadQuestions();
    loadEvaluations();
};
// load questions based on selected sort option
function loadQuestions() {
    const sortOption = document.getElementById('sortOption').value;
    const xhr = new XMLHttpRequest();

    xhr.open('GET', `view_questions.php?sortOption=${sortOption}`, true);
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

    xhr.open('GET', `view_evaluations.php?sortOption=${sortOption}`, true);
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
    xhr.open('GET', `check_responses.php?evaluationID=${evaluationID}`, true);
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

// execute on page load
window.onload = function () {
    loadQuestions();
    loadEvaluations();
};
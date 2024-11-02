// load Published Evaluations for the student's program
function loadPublishedEvaluations() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'view_published_evaluations.php', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById('publishedList').innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}

// load Archived Evaluations for the student's program
function loadArchivedEvaluations() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'view_archived_evaluations.php', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById('archivedList').innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}

// load Questions for a specific evaluation
function loadQuestions() {
    const evaluationName = document.getElementById('evaluationName').value;
    if (!evaluationName) {
        alert("Please enter an evaluation name.");
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `get_evaluation_questions.php?evaluationName=${encodeURIComponent(evaluationName)}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            const response = JSON.parse(xhr.responseText);
            const questionsListDiv = document.getElementById('questionsList');

            if (response.error) {
                questionsListDiv.innerHTML = `<p style="color:red;">${response.error}</p>`;
                document.getElementById('submitAnswersForm').style.display = 'none';
            } else {
                let questionsHtml = '';
                response.questions.forEach(question => {
                    questionsHtml += `
                        <div class="question">
                            <p>${question.QuestionDesc}</p>
                            <input type="text" name="answer_${question.QuestionID}" placeholder="Your answer" required>
                        </div>
                    `;
                });
                questionsListDiv.innerHTML = questionsHtml;
                document.getElementById('submitAnswersForm').style.display = 'block';
            }
        }
    };
    xhr.send();
}

// submit answers
function submitAnswers() {
    const formData = new FormData(document.getElementById('submitAnswersForm'));
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'submit_answers.php', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            alert(xhr.responseText);
            document.getElementById('submitAnswersForm').reset();
            document.getElementById('questionsList').innerHTML = '';
            document.getElementById('submitAnswersForm').style.display = 'none';
        }
    };
    xhr.send(formData);
}

// load evaluations on page load
window.onload = function () {
    loadPublishedEvaluations();
    loadArchivedEvaluations();
};
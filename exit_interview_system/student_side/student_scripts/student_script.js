// load published evaluations for the student's program
function loadPublishedEvaluations() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '../student_side/student_phps/view_published_evaluations.php', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            document.getElementById('publishedList').innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}

// load archived evaluations for the student's program
function loadArchivedEvaluations() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '../student_side/student_phps/view_archived_evaluations.php', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            document.getElementById('archivedList').innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}

// load questions for a specific evaluation using EvaluationID
function loadQuestions() {
    const evaluationID = document.getElementById('evaluationIDInput').value;
    if (!evaluationID) {
        alert("Please enter an Evaluation ID.");
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `../student_side/student_phps/get_evaluation_questions.php?evaluationID=${encodeURIComponent(evaluationID)}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const questionsListDiv = document.getElementById('questionsList');
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.error) {
                    questionsListDiv.innerHTML = `<p style="color:red;">${response.error}</p>`;
                    document.getElementById('submitAnswersForm').style.display = 'none';
                } else {
                    let questionsHtml = '';
                    document.getElementById('evaluationID').value = evaluationID; // set evaluation ID
                    response.questions.forEach(question => {
                        questionsHtml += `
                            <div class="question">
                                <p>${question.questionDesc}</p>
                                <input type="text" name="answer_${question.QuestionID}" placeholder="Your answer" required>
                            </div>
                        `;
                    });
                    questionsListDiv.innerHTML = questionsHtml;
                    document.getElementById('submitAnswersForm').style.display = 'block';
                }
            } else {
                questionsListDiv.innerHTML = `<p style="color:red;">Error loading questions. Please try again.</p>`;
            }
        }
    };
    xhr.send();
}

// submit answers for the current evaluation
function submitAnswers() {
    const formData = new FormData(document.getElementById('submitAnswersForm'));
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '../student_side/student_phps/submit_answers.php', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                alert(xhr.responseText);
                document.getElementById('submitAnswersForm').reset();
                document.getElementById('questionsList').innerHTML = '';
                document.getElementById('submitAnswersForm').style.display = 'none';
            } else {
                alert("Error submitting answers. Please try again.");
            }
        }
    };
    xhr.send(formData);
}

// load evaluations on page load
window.onload = function () {
    loadPublishedEvaluations();
    loadArchivedEvaluations();
};
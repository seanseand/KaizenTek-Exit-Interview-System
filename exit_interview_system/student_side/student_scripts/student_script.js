// load published evaluations for the student's program
function loadPublishedEvaluations() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '../student_side/student_phps/view_published_evaluations.php', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            document.getElementById('publishedList').innerHTML = xhr.responseText;
           setupCardClickEvents();
        }
    };
    xhr.send();
}

function loadMainView() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="tabs">
            <button id="todoButton" class="tab-button">To-Do</button>
            <button id="doneButton" class="tab-button">Done</button>
        </div>
        <div id="publishedList"></div>
        <div id="archivedList" style="display: none;"></div>
    `;

    setupTabListeners();
    loadPublishedEvaluations();
    loadArchivedEvaluations();
}

function setupCardClickEvents() {
    document.querySelectorAll('.evaluation-card-item').forEach(item => {
        item.addEventListener('click', function() {
            const evaluationID = this.querySelector('h2').id.split('-')[1];
            showTemporaryContent(evaluationID)
        });
    });
}

function showTemporaryContent(evaluationID) {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div id="temporaryContent">
            <h2>Content for Evaluation ID: ${evaluationID}</h2>
            <p>This is a placeholder for your evaluation content. Design it as needed.</p>
            <button onclick="loadMainView()">Back to Evaluations</button>
        </div>
    `;
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

// button tab listeners
function setupTabListeners() {
    const todoButton = document.getElementById('todoButton');
    const doneButton = document.getElementById('doneButton');
    const publishedList = document.getElementById('publishedList');
    const archivedList = document.getElementById('archivedList');

    // Load published evals initially
    loadPublishedEvaluations();
    todoButton.classList.add('active')

    todoButton.addEventListener('click', function() {
        setActiveButton(todoButton);
        showPublishedList();
    });

    doneButton.addEventListener('click', function() {
        setActiveButton(doneButton);
        showArchivedList(); 
    });

    function setActiveButton(activeButton) {
        const buttons = document.querySelectorAll('.tab-button');
        buttons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    function showPublishedList() {
        publishedList.style.display = 'flex'
        archivedList.style.display = 'none'
    }

    function showArchivedList() {
        publishedList.style.display = 'none'
        archivedList.style.display = 'flex'
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('../student_side/student_phps/get_username.php')
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

// load evaluations on page load
window.onload = loadMainView;
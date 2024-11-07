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
function loadQuestions(evaluationID) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `../student_side/student_phps/get_evaluation_questions.php?evaluationID=${encodeURIComponent(evaluationID)}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const questionsListDiv = document.getElementById('questionsList');
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.error) {
                    questionsListDiv.innerHTML = `<p style="color:red;">${response.error}</p>`;
                } else {
                    let questionsHtml = '';
                    response.questions.forEach(question => {
                        // questionsHtml += `
                        //     <div class="question-card-item">
                        //         <p>${question.questionDesc}</p>
                        //         <input type="text" name="answer_${question.QuestionID}" placeholder="Your answer" required>
                        //     </div>
                        // `;
                        if (question.QuestionType === 'Multiple Choice') {
                            questionsHtml += `
                                <div class="question-card-item">
                                    <p>${question.questionDesc}</p>
                                    <input type="text" name="answer_${question.QuestionID}" placeholder="Your answer" required>
                                </div>
                            `;
                        } else if (question.QuestionType === 'TrueOrFalse') {
                            questionsHtml += `
                                <div class="question-card-item">
                                    <p>${question.questionDesc}</p>
                                    <label>
                                        <input type="radio" name="answer_${question.QuestionID}" value="true" required> True
                                    </label>
                                    <label>
                                        <input type="radio" name="answer_${question.QuestionID}" value="false" required> False
                                    </label>
                                </div>
                            `;
                        }
                    });
                    questionsListDiv.innerHTML = questionsHtml;
                }
            } else {
                questionsListDiv.innerHTML = `<p style="color:red;">Error loading questions. Please try again.</p>`;
            }
        }
    };
    xhr.send();
}

// Setup click event for each evaluation card
function setupCardClickEvents() {
    document.querySelectorAll('.evaluation-card-item').forEach(item => {
        item.addEventListener('click', function() {
            const evaluationID = this.querySelector('h2').id.split('-')[1];
            const evaluationName = this.querySelector('h2').textContent.trim();
            const startDate = item.querySelector('span[id^="startDate-"]').textContent.trim();
            const endDate = item.querySelector('span[id^="endDate-"]').textContent.trim();
            displayEvaluationQuestions(evaluationID, evaluationName, startDate, endDate);
        });
    });
}

// Function to display evaluation questions
function displayEvaluationQuestions(evaluationID, evaluationName, startDate, endDate) {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
    <div>
        <a class="back" onclick="confirmBack()">
            <img alt="back" src="../resources/left-arrow-svgrepo-com.svg">
        </a>
        <div id="evaluationContent">
            <div class="question-card-item">
                <h1>${evaluationName}</h1>
                <p>${startDate} - ${endDate}</p>
            </div>        
            <div id="questionsList">
                <h2>Loading questions...</h2>
            </div>
    </div>
    `;
    loadQuestions(evaluationID);  // Load questions when evaluation is clicked
}

function confirmBack() {
    if (confirm("Are you sure you want to go back? Your answers will not be saved.")) {
        loadMainView();
    }
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

function confirmLogout() {
    return confirm("Are you sure you want to log out?");
}

// load evaluations on page load
window.onload = loadMainView;
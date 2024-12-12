const hamBurger = document.querySelector("#toggle-btn");
const createEvaluationButton = document.getElementById('create-evaluation-button');
const addQuestionContainer = document.getElementById('add-questions-container');
const setEvaluationButton = document.getElementById('set-evaluation-button');
const createEvaluationForm = document.getElementById('create-evaluation-form');

hamBurger.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("expand");
});

createEvaluationButton.addEventListener('click', function () {
    const modal = new bootstrap.Modal(document.getElementById('createEvaluationModal'));
    modal.show();

    loadQuestions();
});

setEvaluationButton.addEventListener('click', function () {
    // Collect form data
    const evaluationName = document.getElementById('evaluation-name-input').value;
    const programID = document.getElementById('evaluation-program-input').value;
    const semester = document.getElementById('evaluation-semester-input').value;
    const startDate = document.getElementById('evaluation-start-input').value;
    const endDate = document.getElementById('evaluation-end-input').value;

    // Collect selected question IDs
    const selectedQuestions = Array.from(document.querySelectorAll('input[name="selectedQuestions"]:checked'))
        .map(checkbox => checkbox.value);

    // Prepare data to send
    const data = {
        evaluationName: evaluationName,
        programID: programID,
        semester: semester,
        startDate: startDate,
        endDate: endDate,
        questionIDs: selectedQuestions
    };

    // Send POST request to /api/setEvaluations
    fetch('/api/setEvaluations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        // Handle the response
        if (result.message) {
            alert(result.message);
        } else {
            alert('Evaluation created successfully.');
        }
        // Optionally, refresh the evaluations list or close the modal
        loadEvaluations();
        const modal = bootstrap.Modal.getInstance(document.getElementById('createEvaluationModal'));
        modal.hide();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error creating evaluation.');
    });
});

function loadEvaluations() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/view_evaluations', true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);

            const tbody = document.querySelector('#evaluations-table tbody');

            if (response.evaluations && response.evaluations.length > 0) {
                tbody.innerHTML = '';

                response.evaluations.forEach((evaluation) => {
                    const startDate = new Date(evaluation.StartDate).toLocaleDateString('en-GB');
                    const endDate = new Date(evaluation.EndDate).toLocaleDateString('en-GB');

                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${evaluation.EvaluationName}</td>
                        <td>${evaluation.ProgramName}</td>
                        <td>${evaluation.Semester}</td>
                        <td>${startDate}</td>
                        <td>${endDate}</td>
                        <td>${evaluation.Status}</td>
                        <td class="action-buttons">
                            <!-- Edit and Delete buttons will be added here if the status is Draft -->
                        </td>
                    `;

                    const actionCell = row.querySelector('.action-buttons');
                    if (evaluation.Status === 'Draft') {
                        actionCell.innerHTML = `
                            <button class="btn btn-primary btn-sm" onclick="editEvaluation(${evaluation.EvaluationID})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteEvaluation(${evaluation.EvaluationID})">Delete</button>
                        `;
                    }

                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">No evaluations found.</td>
                    </tr>
                `;
            }
        }
    };

    xhr.send();
}

// Load evaluations when the page loads
document.addEventListener('DOMContentLoaded', loadEvaluations);

// Example edit and delete functions (you will replace them with actual logic)
function editEvaluation(evaluationID) {
    console.log(`Edit evaluation with ID: ${evaluationID}`);
    // You can later replace this with code to edit the evaluation (e.g., open a modal with the evaluation details)
}

function deleteEvaluation(evaluationID) {
    console.log(`Delete evaluation with ID: ${evaluationID}`);
    // You can later replace this with code to delete the evaluation (e.g., send a delete request to the server)
}

// Function to load questions and populate the table
function loadQuestions() {
    fetch('/api/view_questions')
        .then(response => response.json())
        .then(data => {
            if (data.questions && data.questions.length > 0) {
                addQuestionContainer.innerHTML = ''; // Clear the container
                addQuestionContainer.appendChild(createQuestionTable(data.questions));
            } else {
                addQuestionContainer.innerHTML = '<p>No questions available.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            addQuestionContainer.innerHTML = '<p>Error loading questions.</p>';
        });
}

// Modify your createQuestionTable function to accept the questions from the API
function createQuestionTable(questions) {
    // Create the table element
    const table = document.createElement('table');
    table.classList.add('table');

    // Create the table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const thCheckbox = document.createElement('th');
    thCheckbox.textContent = 'Select';
    headerRow.appendChild(thCheckbox);

    const thDescription = document.createElement('th');
    thDescription.textContent = 'Question Description';
    headerRow.appendChild(thDescription);

    const thType = document.createElement('th');
    thType.textContent = 'Question Type';
    headerRow.appendChild(thType);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement('tbody');

    questions.forEach(question => {
        const row = document.createElement('tr');

        const tdCheckbox = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'selectedQuestions';
        checkbox.value = question.QuestionID; // Assuming the property is 'QuestionID'
        tdCheckbox.appendChild(checkbox);
        row.appendChild(tdCheckbox);

        const tdDescription = document.createElement('td');
        tdDescription.textContent = question.QuestionDesc;
        row.appendChild(tdDescription);

        const tdType = document.createElement('td');
        tdType.textContent = question.QuestionType;
        row.appendChild(tdType);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
}
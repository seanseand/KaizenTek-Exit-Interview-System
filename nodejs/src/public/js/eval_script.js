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
                            <button class="btn btn-success btn-sm" onclick="publishEvaluation(${evaluation.EvaluationID})">Publish</button>
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

// Get the table and the dropdown menu
const table = document.getElementById('evaluations-table');
const dropdown = document.getElementById('sort');

// Function to sort the table
function sortTable() {
    // Get the selected option
    const selectedOption = dropdown.value;

    // Get the rows of the table body
    const tbody = table.tBodies[0];
    const rows = tbody.rows;

    // Convert the rows to an array
    const rowsArray = Array.from(rows);

    // Sort the rows based on the selected option
    rowsArray.sort((a, b) => {
        // Get the cells of the rows
        const cellsA = a.cells;
        const cellsB = b.cells;

        // Get the values of the cells based on the selected option
        let valueA, valueB;
        switch (selectedOption) {
            case 'EvaluationName':
                valueA = cellsA[0].textContent;
                valueB = cellsB[0].textContent;
                break;
            case 'ProgramName':
                valueA = cellsA[1].textContent;
                valueB = cellsB[1].textContent;
                break;
            case 'Semester':
                valueA = cellsA[2].textContent;
                valueB = cellsB[2].textContent;
                break;
            case 'StartDate':
                valueA = new Date(cellsA[3].textContent);
                valueB = new Date(cellsB[3].textContent);
                break;
            case 'EndDate':
                valueA = new Date(cellsA[4].textContent);
                valueB = new Date(cellsB[4].textContent);
                break;
            case 'Status':
                valueA = cellsA[5].textContent;
                valueB = cellsB[5].textContent;
                break;
            default:
                return 0;
        }

        // Compare the values and return the result
        if (valueA < valueB) {
            return -1;
        } else if (valueA > valueB) {
            return 1;
        } else {
            return 0;
        }
    });

    // Remove the existing rows from the table body
    while (tbody.rows.length > 0) {
        tbody.deleteRow(0);
    }

    // Add the sorted rows to the table body
    rowsArray.forEach(row => {
        tbody.appendChild(row);
    });
}

// Add an event listener to the dropdown menu
dropdown.addEventListener('change', sortTable);

// Load evaluations when the page loads
document.addEventListener('DOMContentLoaded', loadEvaluations);

window.editEvaluation = function (evaluationID) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/get_evaluation?evaluationID=${evaluationID}`, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const evaluation = JSON.parse(xhr.responseText);

            document.getElementById('edit-evaluation-name-input').value = evaluation.EvaluationName;
            document.getElementById('edit-evaluation-semester-input').value = evaluation.Semester;

            const startDate = new Date(evaluation.StartDate).toLocaleDateString('en-CA');
            const endDate = new Date(evaluation.EndDate).toLocaleDateString('en-CA');

            document.getElementById('edit-evaluation-start-input').value = startDate;
            document.getElementById('edit-evaluation-end-input').value = endDate;

            const programSelect = document.getElementById('edit-evaluation-program-input');
            console.log(programSelect.value)
            programSelect.value = evaluation.programID;

            // Store the evaluation ID in the modal for later use (e.g., for saving the changes)
            document.getElementById('editEvaluationModal').setAttribute('data-evaluation-id', evaluationID);
            // Fetch and display the list of questions associated with this evaluation
            loadQuestionsForEdit(evaluationID);


            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('editEvaluationModal'));
            modal.show();
        }
    };
    xhr.send();
};

function loadQuestionsForEdit(evaluationID) {
    fetch(`/api/associated_questions?evaluationID=${evaluationID}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.questions && data.questions.length > 0) {
                const addQuestionContainer = document.getElementById('edit-add-questions-container');
                addQuestionContainer.innerHTML = ''; // Clear the container

                // Separate associated and unassociated questions
                const associatedQuestions = data.questions;
                fetch('/api/view_questions')
                    .then(response => response.json())
                    .then(allData => {
                        const unassociatedQuestions = allData.questions.filter(q => !associatedQuestions.some(aq => aq.QuestionID === q.QuestionID));

                        // Create tables for associated and unassociated questions
                        const associatedTable = createQuestionTableForEdit(associatedQuestions, evaluationID, true);
                        const unassociatedTable = createQuestionTableForEdit(unassociatedQuestions, evaluationID, false);

                        // Append both tables with headings
                        addQuestionContainer.appendChild(createSectionHeader('Questions to Remove'));
                        addQuestionContainer.appendChild(associatedTable);

                        addQuestionContainer.appendChild(createSectionHeader('Available Questions to Add'));
                        addQuestionContainer.appendChild(unassociatedTable);
                    })
                    .catch(error => {
                        console.error('Error fetching all questions:', error);
                        addQuestionContainer.innerHTML = '<p>Error loading questions.</p>';
                    });
            } else {
                addQuestionContainer.innerHTML = '<p>No questions available.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching associated questions:', error);
            addQuestionContainer.innerHTML = '<p>Error loading questions.</p>';
        });
}

function createSectionHeader(title) {
    const header = document.createElement('h5');
    header.textContent = title;
    header.classList.add('mt-3');
    return header;
}

function createQuestionTableForEdit(questions, evaluationID, isAssociated) {
    // Create the table element
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered');

    // Create the table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const thDescription = document.createElement('th');
    thDescription.textContent = 'Question Description';
    headerRow.appendChild(thDescription);

    const thType = document.createElement('th');
    thType.textContent = 'Question Type';
    headerRow.appendChild(thType);

    const thAction = document.createElement('th');
    thAction.textContent = 'Action';
    headerRow.appendChild(thAction);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement('tbody');

    questions.forEach(question => {
        const row = document.createElement('tr');

        const tdDescription = document.createElement('td');
        tdDescription.textContent = question.QuestionDesc;
        row.appendChild(tdDescription);

        const tdType = document.createElement('td');
        tdType.textContent = question.QuestionType;
        row.appendChild(tdType);

        const tdAction = document.createElement('td');
        const actionButton = document.createElement('button');
        actionButton.classList.add('btn', 'btn-sm');

        if (isAssociated) {
            actionButton.textContent = 'remove';
            actionButton.classList.add('btn-danger');
            actionButton.onclick = () => removeQuestionFromEvaluation(evaluationID, question.QuestionID);
        } else {
            actionButton.textContent = 'add';
            actionButton.classList.add('btn-success');
            actionButton.onclick = () => addQuestionToEvaluation(evaluationID, question.QuestionID);
        }
        tdAction.appendChild(actionButton);
        row.appendChild(tdAction);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
}

// Function to add a question to the evaluation
function addQuestionToEvaluation(evaluationID, questionID) {
    fetch('/api/add_or_remove_questions', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'add', evaluationID, questionIDs: questionID})
    })
        .then(response => response.json())
        .then(result => {
            loadQuestionsForEdit(evaluationID);
        })
        .catch(error => {
            console.error('Error adding question:', error);
            alert('Failed to add question.');
        });
}

// Function to remove a question from the evaluation
function removeQuestionFromEvaluation(evaluationID, questionID) {
    fetch('/api/add_or_remove_questions', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'remove', evaluationID, questionIDs: questionID})
    })
        .then(response => response.json())
        .then(result => {
            loadQuestionsForEdit(evaluationID);
        })
        .catch(error => {
            console.error('Error removing question:', error);
            alert('Failed to remove question.');
        });
}

function applyEditEvaluation() {
    console.log('Apply button clicked');  // Check if the function is being triggered

    const evaluationID = document.getElementById('editEvaluationModal').getAttribute('data-evaluation-id');
    const evaluationName = document.getElementById('edit-evaluation-name-input').value.trim();
    const programID = document.getElementById('edit-evaluation-program-input').value.trim();
    const semester = document.getElementById('edit-evaluation-semester-input').value.trim();
    const startDate = document.getElementById('edit-evaluation-start-input').value.trim();
    const endDate = document.getElementById('edit-evaluation-end-input').value.trim();

    if (!evaluationName || !programID || !semester || !startDate || !endDate) {
        alert('All fields are required!');
        return;
    }

    const selectedQuestions = Array.from(document.querySelectorAll('input[name="selectedQuestions"]:checked'))
        .map(checkbox => checkbox.value);

    const formData = {
        evaluationID: evaluationID,
        evaluationName: evaluationName,
        programID: programID,
        semester: semester,
        startDate: startDate,
        endDate: endDate,
        questionIDs: selectedQuestions
    };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/editEvaluations', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log('Response Status:', xhr.status);
            console.log('Response Text:', xhr.responseText);

            if (xhr.status === 200) {
                alert('Evaluation updated successfully.');
                loadEvaluations();
                const modal = bootstrap.Modal.getInstance(document.getElementById('editEvaluationModal'));
                modal.hide();
            } else {
                alert('Error: ' + xhr.status);
            }
        }
    };

    xhr.send(JSON.stringify(formData));
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

// Function to publish an evaluation
function publishEvaluation(evaluationID) {
    // Send a POST request to /api/publish_evaluations
    fetch('/api/publish_evaluations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({evaluationID: evaluationID})
    })
        .then(response => response.json())
        .then(result => {
            // Handle the response
            if (result.message) {
                alert(result.message);
            } else {
                alert('Evaluation published successfully.');
            }
            // Optionally, refresh the evaluations list
            loadEvaluations();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error publishing evaluation.');
        });
}
const hamBurger = document.querySelector("#toggle-btn");
const createQuestionButton = document.getElementById('create-question-button');

hamBurger.addEventListener("click", function () {
    document.querySelector("#sidebar").classList.toggle("expand");
});

createQuestionButton.addEventListener('click', function () {
    const modal = new bootstrap.Modal(document.getElementById('createQuestionModal'));
    modal.show();
});

// Function to load questions based on the selected sorting option
function loadQuestions() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/view_questions`, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);

            // Reference to the table body
            const tbody = document.querySelector('#questions-table tbody');

            if (response.questions && response.questions.length > 0) {
                tbody.innerHTML = ''; // Clear existing rows

                response.questions.forEach((question) => {
                    // Combine FirstName and LastName for CreatorName
                    const creatorName = `${question.CreatorFirstName} ${question.CreatorLastName}`;

                    // Create table row
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${question.QuestionDesc}</td>
                        <td>${question.QuestionType}</td>
                        <td>${creatorName}</td>
                        <td class="action-buttons">
                            <button class="btn btn-primary btn-sm" onclick="editQuestion(${question.QuestionID})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteQuestion(${question.QuestionID})">Delete</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">No questions found.</td>
                    </tr>
                `;
            }
        }
    };

    xhr.send();
}

// Function to handle question creation
document.getElementById('create-question-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Collect form data
    const description = document.getElementById('question-desc-input').value.trim();
    const type = document.getElementById('question-type').value.trim();

    console.log('Question Description:', description);
    console.log('Question Type:', type);

    // Validate required fields
    if (!description || !type) {
        alert('Both fields are required!');
        return;
    }

    // Prepare payload
    const formData = {
        questionDesc: description,  
        questionType: type          
    };

    console.log('Prepared Payload:', JSON.stringify(formData)); // Debug payload

    // Send a POST request
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/addQuestions', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log('Response Status:', xhr.status);
            console.log('Response Text:', xhr.responseText);

            if (xhr.status === 200) {
                alert('Question created successfully.');
                loadQuestions(); // Reload questions table
                const modal = bootstrap.Modal.getInstance(document.getElementById('createQuestionModal'));
                modal.hide();
            } else {
                try {
                    const response = JSON.parse(xhr.responseText);
                    alert(response.message || 'An error occurred.');
                } catch (error) {
                    alert('An unexpected error occurred.');
                }
            }
        }
    };

    // Send JSON payload
    xhr.send(JSON.stringify(formData));
});

// Function to handle the Edit button click
window.editQuestion = function(questionID) {
        
    // Fetch the question data based on questionID
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/get_question?questionID=${questionID}`, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const question = JSON.parse(xhr.responseText);

            // Populate the modal with the question data
            document.getElementById('edit-question-desc-input').value = question.QuestionDesc;
            document.getElementById('edit-question-type').value = question.QuestionType;

            // Store the questionID in the modal
            document.getElementById('editQuestionModal').setAttribute('data-question-id', questionID);

            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('editQuestionModal'));
            modal.show();
        }
    };

    xhr.send();
};

// Function to handle the Apply button click in the Edit modal
function applyEditQuestion() {
    // Get the updated question details from the modal form
    const questionID = document.getElementById('editQuestionModal').getAttribute('data-question-id');
    const description = document.getElementById('edit-question-desc-input').value.trim();
    const type = document.getElementById('edit-question-type').value.trim();

    // Validate required fields
    if (!description || !type) {
        alert('Both fields are required!');
        return;
    }

    // Prepare payload
    const formData = {
        questionID: questionID,
        questionDesc: description,
        questionType: type
    };

    // Send a POST request
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/editQuestions', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log('Response Status:', xhr.status);
            console.log('Response Text:', xhr.responseText);

            if (xhr.status === 200) {
                alert('Question edited successfully.');
                loadQuestions(); // Reload questions table
                const modal = bootstrap.Modal.getInstance(document.getElementById('editQuestionModal'));
                modal.hide();
            } else {
                try {
                    alert('Editing question: ' + (response.message || 'Unknown error.'));
                    loadQuestions();
                } catch (error) {
                    alert('Error: ' + xhr.statusText + '\n' + xhr.responseText);
                }
            }
        }
    };

    // Send JSON payload
    xhr.send(JSON.stringify(formData));
}

// Placeholder for deleting a question
function deleteQuestion(questionID) {
    const confirmDelete = confirm(`Are you sure you want to delete this question?`);
    if (confirmDelete) {
        const xhr = new XMLHttpRequest();
        xhr.open('DELETE', `/api/removeQuestions?questionID=${questionID}`, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        alert('Question deleted successfully!');
                        loadQuestions(); // Reload the questions list
                    } else {
                        alert('Deleting question: ' + (response.message || 'Unknown error.'));
                        loadQuestions();
                    }
                } else {
                    alert('Error: ' + xhr.statusText + '\n' + xhr.responseText);
                }
            }
        };

        xhr.send();
    }
}

// Load questions on page load
document.addEventListener('DOMContentLoaded', loadQuestions);
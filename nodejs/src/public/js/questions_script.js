const hamBurger = document.querySelector("#toggle-btn");
const createQuestionButton = document.getElementById('create-question-button');

hamBurger.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("expand");
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
                tbody.innerHTML = '';  // Clear existing rows

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

// Handle Create Question Form Submission
document.getElementById('save-question-btn').addEventListener('click', createQuestion);

function createQuestion() {
    // Get values from the modal form
    const questionDesc = document.getElementById('question-desc').value;
    const questionType = document.getElementById('question-type').value;

    if (!questionDesc || !questionType) {
        alert("Please fill out all fields.");
        return;
    }

    // Prepare the data for the POST request
    const data = {
        questionDesc: questionDesc,
        questionType: questionType
    };

    // Send the data to the backend using fetch API
    fetch('/api/questions/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Question added successfully!') {
            alert("Question added successfully!");
            // Close the modal
            $('#createQuestionModal').modal('hide');
            // Reload the questions table or perform any other desired action
            loadQuestions();  // Assumes you have a function to refresh the questions
        } else {
            alert(data.message || "Something went wrong.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Error adding question.");
    });
}

document.addEventListener('DOMContentLoaded', loadQuestions);

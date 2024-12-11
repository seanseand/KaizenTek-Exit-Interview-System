const hamBurger = document.querySelector("#toggle-btn");

hamBurger.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("expand");
});

// Function to load evaluations and populate the table dynamically
function loadEvaluations() {
    const xhr = new XMLHttpRequest();

    // Adjust the API endpoint if necessary
    xhr.open('GET', '/api/view_evaluations', true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);

            // Reference to the table body
            const tbody = document.querySelector('#evaluations-table tbody');

            if (response.evaluations && response.evaluations.length > 0) {
                // Clear existing rows
                tbody.innerHTML = '';

                // Populate the table with evaluation data
                response.evaluations.forEach((evaluation) => {
                    // Format the dates
                    const startDate = new Date(evaluation.StartDate).toLocaleDateString('en-GB');
                    const endDate = new Date(evaluation.EndDate).toLocaleDateString('en-GB');

                    // Create table row
                    const row = document.createElement('tr');
                    
                    // Define the cells of the row (without the last one for buttons)
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

                    // Check if status is 'Draft' to allow Edit/Delete buttons
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
                // If no evaluations, display a message
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
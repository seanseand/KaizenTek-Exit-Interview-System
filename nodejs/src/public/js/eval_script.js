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

// Example edit and delete functions (you will replace them with actual logic)
function editEvaluation(evaluationID) {
    console.log(`Edit evaluation with ID: ${evaluationID}`);
    // You can later replace this with code to edit the evaluation (e.g., open a modal with the evaluation details)
}

function deleteEvaluation(evaluationID) {
    console.log(`Delete evaluation with ID: ${evaluationID}`);
    // You can later replace this with code to delete the evaluation (e.g., send a delete request to the server)
}
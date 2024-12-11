const hamBurger = document.querySelector("#toggle-btn");

hamBurger.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("expand");
});

// Function to load evaluations based on the selected sorting option
function loadEvaluations() {
    const sortOption = document.getElementById('evaluationSortOption').value;
    const xhr = new XMLHttpRequest();

    xhr.open('GET', `/api/view_evaluations?sortOption=${sortOption}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            const evaluationsListDiv = document.getElementById('evaluationsList');

            if (response.evaluations && response.evaluations.length > 0) {
                // Create Bootstrap 5 styled table
                let tableHtml = `
                    <table id="evaluations-table" class="table table-striped table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>Evaluation ID</th>
                                <th>Evaluation Name</th>
                                <th>Program ID</th>
                                <th>Semester</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                response.evaluations.forEach((evaluation) => {
                    // Format the dates (Start Date and End Date)
                    const startDate = new Date(evaluation.StartDate).toLocaleDateString('en-GB');
                    const endDate = new Date(evaluation.EndDate).toLocaleDateString('en-GB');

                    // Add a row for each evaluation
                    tableHtml += `
                        <tr>
                            <td>${evaluation.EvaluationID}</td>
                            <td>${evaluation.EvaluationName}</td>
                            <td>${evaluation.ProgramID}</td>
                            <td>${evaluation.Semester}</td>
                            <td>${startDate}</td>
                            <td>${endDate}</td>
                            <td>${evaluation.Status}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" onclick="editEvaluation(${evaluation.EvaluationID})">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteEvaluation(${evaluation.EvaluationID})">Delete</button>
                            </td>
                        </tr>
                    `;
                });

                tableHtml += '</tbody></table>';

                // Inject the table into the evaluationsListDiv
                evaluationsListDiv.innerHTML = tableHtml;

                // Initialize DataTables after the table is populated
                $('#evaluations-table').DataTable({
                    responsive: true,
                    pageLength: 10
                });
            } else {
                evaluationsListDiv.innerHTML = '<p>No evaluations found.</p>';
            }
        }
    };
    xhr.send();
}
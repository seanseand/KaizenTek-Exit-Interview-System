const hamBurger = document.querySelector("#toggle-btn");

hamBurger.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("expand");
});

// function to load questions based on the selected sorting option
function loadQuestions() {
    const sortOption = document.getElementById('sortOption').value;
    const xhr = new XMLHttpRequest();

    xhr.open('GET', `/api/view_questions?sortOption=${sortOption}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            const questionsListDiv = document.getElementById('questionsList');

            if (response.questions && response.questions.length > 0) {
                let tableHtml = `
                <table>
                    <tr>
                        <th>Question ID</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Creator ID</th>
                    </tr>
                `;

                response.questions.forEach((question) => {
                    tableHtml += `
                    <tr>
                        <td>${question.QuestionID}</td>
                        <td>${question.Description}</td>
                        <td>${question.Type}</td>
                        <td>${question.CreatorID}</td>
                    </tr>
                    `;
                });

                tableHtml += '</table>';
                questionsListDiv.innerHTML = tableHtml;
            } else {
                questionsListDiv.innerHTML = '<p>No questions found.</p>';
            }
        }
    };
    xhr.send();
}
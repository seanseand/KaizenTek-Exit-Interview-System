// Load questions for the student
document.addEventListener("DOMContentLoaded", function() {
    const answerForm = document.getElementById("answerForm");
    
    fetch("get_questions.php")
        .then(response => response.json())
        .then(data => {
            data.questions.forEach(question => {
                const questionLabel = document.createElement("label");
                questionLabel.textContent = question.questionDesc;
                
                const answerInput = document.createElement("textarea");
                answerInput.name = "answers[]";
                answerInput.required = true;

                answerForm.appendChild(questionLabel);
                answerForm.appendChild(answerInput);
            });

            const submitButton = document.createElement("button");
            submitButton.type = "submit";
            submitButton.textContent = "Submit Answers";
            answerForm.appendChild(submitButton);
        });
});
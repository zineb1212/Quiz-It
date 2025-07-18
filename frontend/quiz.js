document.addEventListener("DOMContentLoaded", async function () {
    const subjectId = sessionStorage.getItem("subjectId");
    const quizTime = parseInt(sessionStorage.getItem("quizTime"));
    const questionLimit = parseInt(sessionStorage.getItem("questionLimit"));
  
    // At quiz start:
    const session_id = crypto.randomUUID(); // or use a UUID library
    sessionStorage.setItem('quizSessionId', session_id);

    if (!subjectId || isNaN(quizTime) || isNaN(questionLimit)) {
      alert("Missing quiz data. Redirecting to dashboard...");
      window.location.href = "index.html";
      return;
    }
  
    const quizContainer = document.getElementById("quiz-container");
  
    const resultLabel = document.createElement("div");
    resultLabel.id = "resultLabel";
    resultLabel.style.marginTop = "20px";
    resultLabel.style.padding = "15px";
    resultLabel.style.borderRadius = "8px";
    resultLabel.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.2)";
    resultLabel.style.display = "none";
    resultLabel.style.textAlign = "center";
    resultLabel.style.fontSize = "18px";
    resultLabel.style.fontWeight = "bold";
    quizContainer.after(resultLabel);
  
    const nextBtn = document.createElement("button");
    nextBtn.id = "nextBtn";
    nextBtn.innerText = "Next ➡️";
    nextBtn.style.display = "none";
    nextBtn.style.marginTop = "20px";
    nextBtn.style.padding = "12px 24px";
    nextBtn.style.fontSize = "18px";
    nextBtn.style.fontWeight = "bold";
    nextBtn.style.color = "white";
    nextBtn.style.backgroundColor = "#007bff";
    nextBtn.style.border = "none";
    nextBtn.style.borderRadius = "8px";
    nextBtn.style.cursor = "pointer";
    nextBtn.style.transition = "all 0.3s ease-in-out";
    nextBtn.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    nextBtn.style.marginLeft = "auto";
    nextBtn.style.display = "block";
    nextBtn.style.width = "fit-content";
  
    nextBtn.addEventListener("mouseover", () => {
      nextBtn.style.backgroundColor = "#0056b3";
      nextBtn.style.transform = "scale(1.05)";
    });
  
    nextBtn.addEventListener("mouseout", () => {
      nextBtn.style.backgroundColor = "#007bff";
      nextBtn.style.transform = "scale(1)";
    });
  
    nextBtn.addEventListener("click", nextQuestion);
    resultLabel.after(nextBtn);
  
    let questions = [];
    let numQuestion=0;
    let currentQuestionIndex = 0;
    let timerInterval;
    let timeLeft = quizTime * 60; // in seconds
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/questions?subject_id=${subjectId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const allQuestions = await response.json();
  
      if (allQuestions.length === 0) {
        quizContainer.innerHTML = "<p>No questions available for this category.</p>";
        return;
      }
  
      questions = allQuestions.slice(0, questionLimit); // limit questions
      numQuestion = allQuestions.length;
      startTimer(); // start countdown timer
      displayQuestion(); // show first question
    } catch (error) {
      quizContainer.innerHTML = "<p>Error fetching questions. Please try again later.</p>";
      console.error("Fetch error:", error);
    }
  
    function startTimer() {
      const timerDisplay = document.createElement("div");
      timerDisplay.id = "timer";
      timerDisplay.style.fontSize = "20px";
      timerDisplay.style.fontWeight = "bold";
      timerDisplay.style.marginBottom = "10px";
      timerDisplay.style.textAlign = "center";
      timerDisplay.style.color = "#ff5722";
      quizContainer.before(timerDisplay);
  
      timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `⏳ Time Left: ${minutes}:${seconds.toString().padStart(2, "0")}`;
  
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          endQuiz("timeout");
        }
  
        timeLeft--;
      }, 1000);
    }
  
    function displayQuestion() {
      if (currentQuestionIndex >= questions.length) {
        endQuiz("completed");
        return;
      }
  
      const q = questions[currentQuestionIndex];
  
      quizContainer.innerHTML = `
        <div class="question">${currentQuestionIndex + 1}. ${q.question_text}</div>
        <div class="options">
            <button onclick="window.checkAnswer(this, '${q.question_id}', 'A')">${q.option_a}</button>
            <button onclick="window.checkAnswer(this, '${q.question_id}', 'B')">${q.option_b}</button>
            <button onclick="window.checkAnswer(this, '${q.question_id}', 'C')">${q.option_c}</button>
            <button onclick="window.checkAnswer(this, '${q.question_id}', 'D')">${q.option_d}</button>
        </div>
      `;
  
      resultLabel.style.display = "none";
      nextBtn.style.display = "none";
    }
  
    window.checkAnswer = async function (button, questionId, selectedOption) {
           try {
         const token = localStorage.getItem("token");
         const subject_id = sessionStorage.getItem("subjectId"); // Get subject ID here 
         const response = await fetch("http://localhost:5000/check-answer", {
          method: "POST",
          headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
           question_id: questionId,
           selected_option: selectedOption,
           subject_id: subject_id // Use the correct subject ID
          }),
         });  
         const result = await response.json();
         resultLabel.style.display = "block"; 
         // Store the user's response and correctness
         if (!window.userResponses) {
          window.userResponses = {};
         }
         window.userResponses[questionId] = {
          selectedOption: selectedOption,
          isCorrect: result.correct
         }; 
         if (result.correct) {
          button.style.backgroundColor = "green";
          resultLabel.innerHTML = `✅ <b>Correct!</b><br><b>Explanation:</b> ${result.Explanation}`;
          resultLabel.style.color = "white";
          resultLabel.style.backgroundColor = "#28a745";
          resultLabel.style.border = "2px solid #218838";
         } else {
          button.style.backgroundColor = "red";
          resultLabel.innerHTML = `❌ <b>Wrong!</b><br>✅ <b>Correct Answer:</b> ${result.correct_option}<br><b>Explanation:</b> ${result.Explanation}`;
          resultLabel.style.color = "white";
          resultLabel.style.backgroundColor = "#dc3545";
          resultLabel.style.border = "2px solid #c82333";
         }  
         const buttons = button.parentElement.querySelectorAll("button");
         buttons.forEach((btn) => (btn.disabled = true)); 
         nextBtn.style.display = "block";
        } catch (error) {
         console.error("Error checking answer:", error);
         alert("Failed to check answer. Please try again.");
        }
       };
  
    function nextQuestion() {
      currentQuestionIndex++;
      displayQuestion();
    }
  
    function endQuiz(reason = "completed") {
       clearInterval(timerInterval); // stop timer
      
       // Calculate score
       const correctAnswers = questions.filter(q =>
        window.userResponses && window.userResponses[q.question_id]?.isCorrect // Use question_id here
       ).length;
       const totalQuestions = questions.length;
       const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

      // Prepare result message
      let message = "";
      if (reason === "timeout") {
          message = "⏰ Time's up!";
      } else if (reason === "completed") {
          message = "✅ Quiz Completed!";
      }

      // Display results
      quizContainer.innerHTML = `
          <div style="
              background-color: #f4f4f4;
              padding: 30px;
              border-radius: 12px;
              text-align: center;
              box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
              font-size: 20px;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
          ">
              <h2 style="color: #007bff; margin-bottom: 20px;">${message}</h2>
              
              <div style="
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              ">
                  <div style="font-size: 24px; margin-bottom: 10px;">
                      🎯 Your Score: <strong>${correctAnswers}/${totalQuestions}</strong>
                  </div>
                  <div style="font-size: 32px; color: ${scorePercentage >= 70 ? '#28a745' : '#dc3545'}; 
                      font-weight: bold; margin: 10px 0;">
                      ${scorePercentage}%
                  </div>
                  <div style="height: 10px; background: #e9ecef; border-radius: 5px; margin: 15px 0;">
                      <div style="
                          height: 100%;
                          width: ${scorePercentage}%;
                          background: ${scorePercentage >= 70 ? '#28a745' : '#dc3545'};
                          border-radius: 5px;
                      "></div>
                  </div>
              </div>

              <button id="dashboard-btn" style="
                  padding: 12px 24px;
                  font-size: 16px;
                  font-weight: bold;
                  background-color: #007bff;
                  color: white;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                  transition: all 0.3s;
                  margin-top: 20px;
                  ">
                  🏠 Go to Dashboard
                  </button>
                  </div>
                  `;
                  
      // Submit score to backend
      submitScore(correctAnswers, totalQuestions);
      // Add click handler for the dashboard button
      document.getElementById("dashboard-btn").addEventListener("click", () => {
        window.location.href = "dashboard.html";
      });

      resultLabel.style.display = "none";
      nextBtn.style.display = "none";
  }

  async function submitScore(correctAnswers, totalQuestions) {
    try {
        const response = await fetch("http://localhost:5000/submit-score", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                subject_id: sessionStorage.getItem("subjectId"),
                questions_attempted: totalQuestions, // Explicitly set
                score: correctAnswers,
                total_questions: numQuestion,
                session_id: sessionStorage.getItem('quizSessionId')
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Score submission failed");
        }

        return await response.json();
    } catch (error) {
        console.error("Submission error:", error);
        // Show user-friendly error
        alert(`Failed to save results: ${error.message}`);
        throw error;
    }
}

  // Initialize user responses tracking
  window.userResponses = {};
  
  


  resultLabel.style.display = "none";
  nextBtn.style.display = "none";
});
  
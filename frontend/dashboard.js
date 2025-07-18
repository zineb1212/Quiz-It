let selectedSubjectId = null;

document.querySelectorAll('.category').forEach(category => {
  category.addEventListener('click', function () {
    // Remove highlight from all
    document.querySelectorAll('.category').forEach(c => c.classList.remove('selected'));
    
    // Highlight selected
    this.classList.add('selected');
    
    selectedSubjectId = this.getAttribute('data-subject-id');

    // Show the quiz setup section
    document.getElementById('quiz-setup').style.display = 'block';
  });
});

// Add Score History button to your HTML (you'll need to add this button in your dashboard.html)
document.getElementById('score-history-btn').addEventListener('click', function() {
  fetchUserScoreHistory();
});

// Function to fetch and display score history
function fetchUserScoreHistory() {
  const token = localStorage.getItem('token'); // Assuming you store JWT token here
  
  fetch("http://localhost:5000/scores", {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      }
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(scores => {
      displayScoreHistory(scores);
  })
  .catch(error => {
      console.error('Error fetching score history:', error);
      alert('Failed to load score history');
  });
}

// Function to display score history in a modal
function displayScoreHistory(scores) {
  // Create modal HTML
  const modalHTML = `
      <div class="modal" id="score-history-modal" style="display:block;">
          <div class="modal-content">
              <span class="close-btn">&times;</span>
              <h2>Your Quiz History</h2>
              ${scores.length > 0 ? 
                  `<table>
                      <thead>
                          <tr>
                              <th>Subject</th>
                              <th>Score</th>
                              <th>Percentage</th>
                              <th>Date</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${scores.map(score => `
                              <tr>
                                  <td>${score.subject_name}</td>
                                  <td>${score.score}/${score.total_questions}</td>
                                  <td>${score.percentage.toFixed(1)}%</td>
                                  <td>${new Date(score.timestamp).toLocaleString()}</td>
                              </tr>
                          `).join('')}
                      </tbody>
                  </table>` 
                  : '<p>No quiz history found.</p>'}
          </div>
      </div>
  `;
  
  // Add modal to the page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Add close button functionality
  document.querySelector('#score-history-modal .close-btn').addEventListener('click', function() {
      document.getElementById('score-history-modal').remove();
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
      const modal = document.getElementById('score-history-modal');
      if (event.target === modal) {
          modal.remove();
      }
  });
}

document.getElementById('quiz-time').addEventListener('change', function () {
  const customTimeInput = document.getElementById('custom-time');
  customTimeInput.style.display = this.value === 'custom' ? 'inline-block' : 'none';
});

document.getElementById('question-count').addEventListener('change', function () {
  const customCountInput = document.getElementById('custom-question-count');
  customCountInput.style.display = this.value === 'custom' ? 'inline-block' : 'none';
});

document.getElementById('start-quiz-btn').addEventListener('click', function () {
  let time = document.getElementById('quiz-time').value;
  let questionCount = document.getElementById('question-count').value;

  if (time === 'custom') {
    time = document.getElementById('custom-time').value;
  }

  if (questionCount === 'custom') {
    questionCount = document.getElementById('custom-question-count').value;
  }

  if (!time || !questionCount || !selectedSubjectId || time <= 0 || questionCount <= 0) {
    alert("Please fill all quiz options with valid values.");
    return;
  }

  // Store in sessionStorage
  sessionStorage.setItem('subjectId', selectedSubjectId);
  sessionStorage.setItem('quizTime', time);
  sessionStorage.setItem('questionLimit', questionCount);

  // Redirect to quiz.html
  window.location.href = 'quiz.html';
});



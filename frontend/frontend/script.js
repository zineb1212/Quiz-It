let slideIndex = 0;
const slides = document.querySelectorAll('.slide');

function showSlides() {
    slides.forEach((slide, index) => {
        slide.style.opacity = index === slideIndex ? '1' : '0';
    });
    slideIndex = (slideIndex + 1) % slides.length;
    setTimeout(showSlides, 4000);
}

document.addEventListener("DOMContentLoaded", showSlides);


// Function to update greeting message based on time
function updateGreeting() {
    let greetingMessage = document.getElementById("greeting-message");
    let hours = new Date().getHours();
    
    if (hours < 12) {
        greetingMessage.textContent = "Good Morning!";
    } else if (hours < 18) {
        greetingMessage.textContent = "Good Afternoon!";
    } else {
        greetingMessage.textContent = "Good Evening!";
    }
}
// Call function on page load
window.onload = updateGreeting;


// Handle Login Switching
document.addEventListener("DOMContentLoaded", function () {
    let adminLoginBtn = document.getElementById("admin-login-btn");
    let userLoginBox = document.getElementById("user-login");
    let adminLoginBox = document.getElementById("admin-login");
    let backToUserBtn = document.getElementById("back-to-user");

    // Switch to Admin Login
    adminLoginBtn.addEventListener("click", function (event) {
        event.preventDefault();
        userLoginBox.classList.add("hidden");
        adminLoginBox.classList.remove("hidden");
    });

    // Switch back to User Login
    backToUserBtn.addEventListener("click", function () {
        adminLoginBox.classList.add("hidden");
        userLoginBox.classList.remove("hidden");
    });

    
});

document.addEventListener("DOMContentLoaded", function () {
    const userLoginBox = document.getElementById("user-login");
    const userRegisterBox = document.getElementById("user-register");

    const showRegisterBtn = document.getElementById("show-register");
    const backToLoginBtn = document.getElementById("back-to-login");

    // ✅ Switch to Registration
    showRegisterBtn.addEventListener("click", function (e) {
        e.preventDefault();
        userLoginBox.classList.add("hidden");
        userRegisterBox.classList.remove("hidden");
    });

    // ✅ Switch back to Login
    backToLoginBtn.addEventListener("click", function (e) {
        e.preventDefault();
        userRegisterBox.classList.add("hidden");
        userLoginBox.classList.remove("hidden");
    });

    // ✅ Handle Registration Form Submit
    const registerForm = document.getElementById("user-register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const name = document.getElementById("register-name").value.trim();
            const email = document.getElementById("register-email").value.trim();
            const password = document.getElementById("register-password").value;
            const messageElement = document.getElementById("user-register-message");

            try {
                const response = await fetch("http://localhost:5000/users/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const result = await response.json();

                if (response.ok) {
                    messageElement.style.color = "green";
                    messageElement.textContent = result.message;
                    registerForm.reset();

                    // Automatically go back to login after success
                    setTimeout(() => {
                        userRegisterBox.classList.add("hidden");
                        userLoginBox.classList.remove("hidden");
                    }, 1500);
                } else {
                    messageElement.style.color = "red";
                    messageElement.textContent = result.error;
                }
            } catch (err) {
                console.error("Registration error:", err.message);
                messageElement.style.color = "red";
                messageElement.textContent = "Something went wrong. Try again.";
            }
        });
    }
});


// Add this script to your login page
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form') || document.getElementById('loginForm');
    
    // If there's no form, create event listeners for the login button
    if (!loginForm) {
        const loginButton = document.querySelector('button') || document.querySelector('.login-button') || document.querySelector('button[type="submit"]');
        if (loginButton) {
            loginButton.addEventListener('click', handleLogin);
        }
    } else {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    function handleLogin() {
        const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[placeholder*="email"]') || document.querySelector('input');
        const passwordInput = document.querySelector('input[type="password"]') || document.querySelectorAll('input')[1];
        
        if (!emailInput || !passwordInput) {
            console.error("Couldn't find email or password input fields");
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            alert("Please enter both email and password");
            return;
        }
        
        // Make API call to your backend
        fetch('http://localhost:5000/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            mode: 'cors' // Ensure CORS mode is enabled
        })
        
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Login failed');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Login successful', data);
            // Store the token in localStorage
            localStorage.setItem('token', data.token);
            // Redirect to the dashboard or home page
            window.location.href = '/dashboard.html'; // Adjust this path
        })
        .catch(error => {
            console.error('Login error:', error.message);
            alert(`Login failed: ${error.message}`);
        });
    }
});



function displayQuestions(questions) {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = ''; // Clear existing questions

    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question-item');

        questionDiv.innerHTML = `
            <h3>Q${index + 1}: ${question.question_text}</h3>
            <ul>
                <li>A: ${question.option_a}</li>
                <li>B: ${question.option_b}</li>
                <li>C: ${question.option_c}</li>
                <li>D: ${question.option_d}</li>
            </ul>
            <p><strong>Answer:</strong> ${question.correct_answer}</p>
        `;

        questionContainer.appendChild(questionDiv);
    });
}




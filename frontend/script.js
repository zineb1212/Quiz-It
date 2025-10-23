const API_URL = "http://127.0.0.1:5000";
let slideIndex = 0;
const slides = document.querySelectorAll('.slide');

function showSlides() {
    slides.forEach((slide, index) => {
        slide.style.opacity = index === slideIndex ? '1' : '0';
    });
    slideIndex = (slideIndex + 1) % slides.length;
    setTimeout(showSlides, 4000);
}

function updateGreeting() {
    let greetingMessage = document.getElementById("greeting-message");
    if (!greetingMessage) return;

    let hours = new Date().getHours();
    if (hours < 12) greetingMessage.textContent = "Good Morning!";
    else if (hours < 18) greetingMessage.textContent = "Good Afternoon!";
    else greetingMessage.textContent = "Good Evening!";
}

function displayQuestions(questions) {
    const questionContainer = document.getElementById('question-container');
    if (!questionContainer) return;
    questionContainer.innerHTML = ''; 

    questions.forEach((q, i) => {
        const div = document.createElement('div');
        div.classList.add('question-item');
        div.innerHTML = `
            <h3>Q${i + 1}: ${q.question_text}</h3>
            <ul>
                <li>A: ${q.option_a}</li>
                <li>B: ${q.option_b}</li>
                <li>C: ${q.option_c}</li>
                <li>D: ${q.option_d}</li>
            </ul>
            <p><strong>Answer:</strong> ${q.correct_option}</p>
        `;
        questionContainer.appendChild(div);
    });
}

function initLoginRegister() {
    const userLoginBox = document.getElementById("user-login");
    const adminLoginBox = document.getElementById("admin-login");
    const userRegisterBox = document.getElementById("user-register");

    // Switch login forms
    document.getElementById("admin-login-btn")?.addEventListener("click", e => {
        e.preventDefault();
        userLoginBox?.classList.add("hidden");
        adminLoginBox?.classList.remove("hidden");
    });

    document.getElementById("back-to-user")?.addEventListener("click", () => {
        adminLoginBox?.classList.add("hidden");
        userLoginBox?.classList.remove("hidden");
    });

    // Switch registration
    document.getElementById("show-register")?.addEventListener("click", e => {
        e.preventDefault();
        userLoginBox?.classList.add("hidden");
        userRegisterBox?.classList.remove("hidden");
    });

    document.getElementById("back-to-login")?.addEventListener("click", e => {
        e.preventDefault();
        userRegisterBox?.classList.add("hidden");
        userLoginBox?.classList.remove("hidden");
    });

    // Registration form
    const registerForm = document.getElementById("user-register-form");
    registerForm?.addEventListener("submit", async e => {
        e.preventDefault();
        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;
        const messageElement = document.getElementById("user-register-message");

        try {
            const res = await fetch(`${API_URL}/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                messageElement.style.color = "green";
                messageElement.textContent = data.message;
                registerForm.reset();
                setTimeout(() => {
                    userRegisterBox.classList.add("hidden");
                    userLoginBox.classList.remove("hidden");
                }, 1500);
            } else {
                messageElement.style.color = "red";
                messageElement.textContent = data.error;
            }
        } catch (err) {
            messageElement.style.color = "red";
            messageElement.textContent = "Something went wrong. Try again.";
            console.error("Registration error:", err);
        }
    });
}

function initLogin() {
    const loginForm = document.querySelector('form') || document.getElementById('loginForm');
    const handleLogin = async () => {
        const email = document.querySelector('input[type="email"]')?.value.trim();
        const password = document.querySelector('input[type="password"]')?.value;

        if (!email || !password) return alert("Please enter both email and password");

        try {
            const res = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            localStorage.setItem('token', data.token);
            window.location.href = './dashboard.html';
        } catch (err) {
            alert(`Login failed: ${err.message}`);
            console.error("Login error:", err);
        }
    };

    if (loginForm) loginForm.addEventListener("submit", e => { e.preventDefault(); handleLogin(); });
    else document.querySelector('button')?.addEventListener("click", handleLogin);
}

document.addEventListener("DOMContentLoaded", () => {
    showSlides();
    updateGreeting();
    initLoginRegister();
    initLogin();
});

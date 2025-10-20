var d = document;
var cross = d.getElementById("cross");
var advice = d.getElementById("advice");
advice.style.opacity = "1";

function createCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = "; expires=" + date.toGMTString();
	}
	else 
    var expires = "";
	document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

if (readCookie("done") == "yes") {
  advice.style.display = "none";
}

var loginBlock = d.getElementById("loginBlock");
var loginContent = d.getElementById("loginContent");
var bar = d.getElementById("bar");
var signupBlock = d.getElementById("signupBlock");
var signupContent = d.getElementById("signupContent");
var title = d.getElementById("title");
var text = d.getElementById("text");
var leftSide = d.getElementById("leftSide");
var rightSide = d.getElementById("rightSide");
var toggle = d.getElementById("toggle");
var loginText = d.getElementById("loginText");
var signupText = d.getElementById("signupText");

toggle.addEventListener("click", function(event) {
  event.stopPropagation();
  if(loginBlock.style.marginLeft == "-600px") {
    loginBlock.style.marginLeft = "0px";
    bar.style.marginLeft = "calc(100% - 200px)";
    signupBlock.style.left = "100%";
    loginContent.style.marginLeft = "0px";
    rightSide.style.right = "0px";
    leftSide.style.left = "-300px";
    signupText.style.top = "50%";
    loginText.style.top = "-100%";
  }
  else {
    loginBlock.style.marginLeft = "-600px";
    bar.style.marginLeft = "0px";
    signupBlock.style.left = "200px";
    loginContent.style.marginLeft = "1000px";
    rightSide.style.right = "-300px";
    leftSide.style.left = "0px";
    signupText.style.top = "200%";
    loginText.style.top = "50%";
  }
  if (signupContent.style.marginLeft == "0px") {
    signupContent.style.marginLeft = "-800px";
  }
  else {
    signupContent.style.marginLeft = "0px";
  }
});

window.addEventListener("click", 
function() {
  if (readCookie("done") != "yes") {
      createCookie("done", "yes");
  }
  advice.style.opacity = "0";
  setTimeout(function() {
    advice.style.visibility = "hidden";
  }, 1500)
});

// API Base URL
const API_URL = 'http://localhost:3000';

// Signup Logic with MongoDB
const signupForm = d.getElementById('signupForm');
const signupButton = signupForm.querySelector('input[type="button"]');

signupButton.addEventListener('click', async function() {
    const name = signupForm.querySelector('#name').value;
    const username = signupForm.querySelector('#signup-username').value;
    const email = signupForm.querySelector('#email').value;
    const password = signupForm.querySelector('#signup-password').value;

    if (!name || !username || !email || !password) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Sign up successful! You can now log in.');
            signupForm.reset();
        } else {
            alert(data.message || 'Signup failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Login Logic with MongoDB
const loginForm = d.getElementById('loginForm');
const loginButton = loginForm.querySelector('input[type="button"]');

loginButton.addEventListener('click', async function() {
    const username = loginForm.querySelector('#login-username').value;
    const password = loginForm.querySelector('#login-password').value;

    if (!username || !password) {
        alert('Please enter username and password.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login successful!');
            // Store user info in sessionStorage
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            sessionStorage.setItem('lastLogin', new Date().toLocaleString());
            loginForm.reset();
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Forgot Password Logic with MongoDB
const forgotPasswordLink = d.getElementById('forgotPassword');
forgotPasswordLink.addEventListener('click', async function(event) {
    event.preventDefault();
    const username = prompt('Please enter your username or email to retrieve your password:');
    if (!username) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
        } else {
            alert(data.message || 'Account not found');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Show/Hide Password Logic
const passwordToggles = d.querySelectorAll('.show-password');
passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
        const passwordInput = this.previousElementSibling;
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        } else {
            passwordInput.type = 'password';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        }
    });
});

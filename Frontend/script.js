console.log("JS file loaded");
/* ================================
        API BASE URL
================================ */
const API_BASE = "https://6lwgxxxfac.execute-api.us-east-1.amazonaws.com";

/* ================================
        SIGNUP FORM
================================ */
const signupForm = document.getElementById('signupForm');
const signupMessage = document.getElementById('signupMessage');

signupForm?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const pw = document.getElementById('password').value;
  const confirmPw = document.getElementById('confirmPassword').value;

  // Validation
  if (!name || !email || !pw || !confirmPw) {
    signupMessage.textContent = "❌ Please fill all fields!";
    signupMessage.style.color = "red";
    return;
  }

  if (!email.includes("@")) {
    signupMessage.textContent = "❌ Please enter a valid email!";
    signupMessage.style.color = "red";
    return;
  }

  if (pw.length < 6) {
    signupMessage.textContent = "❌ Password must be 6+ characters!";
    signupMessage.style.color = "red";
    return;
  }

  if (pw !== confirmPw) {
    signupMessage.textContent = "❌ Passwords do not match!";
    signupMessage.style.color = "red";
    return;
  }

  try {
    const response = await fetch(API_BASE + "/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: pw })
    });

    const result = await response.json();

    if (response.ok) {
      signupMessage.textContent = "✅ Your account created successfully!";
      signupMessage.style.color = "green";


      localStorage.setItem("email", email);
      localStorage.setItem("password", pw);

      signupForm.reset();
      setTimeout(() => window.location.href = "login.html", 2000);
    } else {
      signupMessage.textContent = "❌ Signup Failed: " + (result.message || "Try again");
      signupMessage.style.color = "red";
    }

  } catch (error) {
    signupMessage.textContent = "❌ Server Error!";
    signupMessage.style.color = "red";
    console.log(error);
  }
});
console.log("Signup button clicked");


/* ================================
        LOGIN FORM
================================ */
function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  const savedEmail = localStorage.getItem("email");
  const savedPass = localStorage.getItem("password");

  if (email === savedEmail && pass === savedPass) {
    window.location.href = "view-trips.html";
  } else {
    alert("Wrong email or password");
  }
}


/* ================================
        CREATE TRIP
================================ */
async function createTrip() {
  const tripName = document.getElementById("tripName").value.trim();
  const location = document.getElementById("location").value.trim();
  const date = document.getElementById("date").value.trim();
  const budget = document.getElementById("budget").value.trim();
  const tripMessage = document.getElementById("tripMessage");

  if (!tripName || !location || !date || !budget) {
    tripMessage.textContent = "❌ Please fill all fields!";
    tripMessage.style.color = "red";
    return;
  }

  const data = { tripName, location, date, budget };

  try {
    const response = await fetch(API_BASE + "/createTrip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      localStorage.setItem("tripData", JSON.stringify(data));

      tripMessage.textContent = "✅ Trip Created Successfully!";
      tripMessage.style.color = "green";

      setTimeout(() => window.location.href = "itinerary.html", 1500);
    } else {
      tripMessage.textContent = "❌ Failed: " + (result.message || "Try again");
      tripMessage.style.color = "red";
    }

  } catch (error) {
    tripMessage.textContent = "❌ Server Error!";
    tripMessage.style.color = "red";
    console.log(error);
  }
}


/* ================================
        NAVIGATION BUTTONS
================================ */
function nav(page) {
  if (page === "login") window.location.href = "login.html";
  else if (page === "create") window.location.href = "create-trip.html";
  else if (page === "view") window.location.href = "view-trips.html";
}


/* ================================
        MULTI STEP FORM
================================ */
function nextStep(step) {
  document.getElementById("step" + step)?.classList.remove("active");
  document.getElementById("step" + (step + 1))?.classList.add("active");
}

function prevStep(step) {
  document.getElementById("step" + step)?.classList.remove("active");
  document.getElementById("step" + (step - 1))?.classList.add("active");
}


/* ================================
        REVIEW DATA
================================ */
function showReview() {
  const tripName = document.getElementById("tripName").value;
  const location = document.getElementById("location").value;
  const date = document.getElementById("date").value;
  const budget = document.getElementById("budget").value;

  document.getElementById("reviewData").innerHTML = `
        <p><strong>Name:</strong> ${tripName}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Budget:</strong> ₹${budget}</p>
    `;
}
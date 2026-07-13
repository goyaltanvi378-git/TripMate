
/* ================================
        API BASE URL
================================ */
const API_BASE = "https://6lwgxxxfac.execute-api.us-east-1.amazonaws.com";

/* ================================
        SIGNUP FORM
================================ */
// 1. AWS Cognito Configuration (Inhe apni IDs se replace karein)
document.getElementById('SignupForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const pw = document.getElementById('password').value;
  const name = "User"; // Aap chahein toh name field se le sakte hain

  // Purani validations chalti rahengi
  const eRes = validateEmail(email);
  const pRes = validatePassword(pw);
  setFieldState('emailField', 'emailMsg', eRes.ok ? 'valid' : 'error', eRes.msg);
  setFieldState('pwField', 'pwMsg', pRes.ok ? 'valid' : 'error', pRes.msg);
  if (!eRes.ok || !pRes.ok) return;

  const btn = document.getElementById('signupBtn');
  btn.classList.add('loading'); btn.disabled = true;

  // Cognito Configuration
  const poolData = {
    UserPoolId: 'us-east-1_O6KoZw9aK', // <--- Apni ID yahan dalein
    ClientId: '7rg98lb8c2qia8jtlspd8spd15'     // <--- Apni ID yahan dalein
  };
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  const attributeList = [
    new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email })
  ];

  userPool.signUp(email, pw, attributeList, null, (err, result) => {
    btn.classList.remove('loading');
    btn.disabled = false;

    if (err) {
      if (err.code === 'UsernameExistsException') {
        showToast('⚠️ Account already exists! Redirecting to login...', 'success');
        setTimeout(() => { window.location.href = "login.html"; }, 1500);
      } else {
        showToast('❌ ' + (err.message || 'Signup failed'));
      }
      return;
    }

    showToast('✅ Account Created Successfully!', 'success');
    setTimeout(() => { window.location.href = "login.html"; }, 1500);
  });
});

/* ================================
        LOGIN FORM
================================ */
/* ══ Login Function (AWS Cognito) ══ */
/* ══ Login Submit Handler ══ */
document.getElementById('LoginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Cognito Configuration
  const poolData = {
    UserPoolId: 'us-east-1_O6KoZw9aK', // Apni User Pool ID dalein
    ClientId: '7rg98lb8c2qia8jtlspd8spd15'   // Apni Nayi Public Client ID (Bina secret wali)
  };
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  const authDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const userData = { Username: email, Pool: userPool };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  // Button loading state
  const btn = document.getElementById('loginBtn');
  btn.disabled = true;

  cognitoUser.authenticateUser(authDetails, {
    onSuccess: function (result) {
      console.log('Login Success');
      // Token save karein taaki dashboard ko pata chale ki aap logged in hain
      localStorage.setItem("userToken", result.getAccessToken().getJwtToken());
      localStorage.setItem("userEmail", email);

      alert("Login Successful!");
      window.location.href = "view-trips.html"; // <--- Yahan apna page name check karein
    },
    onFailure: function (err) {
      btn.disabled = false;
      alert(err.message || JSON.stringify(err));
      console.error(err);
    }
  });
});


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
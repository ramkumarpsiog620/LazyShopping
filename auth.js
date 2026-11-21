import { firebaseConfig, AUTH_URL, FIRESTORE_URL } from "./firebase-config.js";

const form = document.getElementById("authForm");
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const nameLabel = document.getElementById("nameLabel");
const nameInput = document.getElementById("name");
const title = document.getElementById("formTitle");
const subtitle = document.getElementById("formSubtitle");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");
let mode = "login";

function setMode(next) {
  mode = next;
  const signup = mode === "signup";
  loginTab.classList.toggle("active", !signup);
  signupTab.classList.toggle("active", signup);
  nameLabel.classList.toggle("hidden", !signup);
  nameInput.required = signup;
  title.textContent = signup ? "Create account" : "Sign in";
  subtitle.textContent = signup ? "Create your customer account to get started." : "Enter your account details to continue.";
  submitBtn.textContent = signup ? "Create account" : "Sign in";
  message.textContent = "";
}
loginTab.addEventListener("click", () => setMode("login"));
signupTab.addEventListener("click", () => setMode("signup"));

async function authRequest(endpoint, payload) {
  const response = await fetch(`${AUTH_URL}/${endpoint}?key=${firebaseConfig.apiKey}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Authentication failed");
  return data;
}
function firestoreString(value) { return { stringValue: String(value) }; }

async function saveCustomerProfile(user, displayName) {
  const response = await fetch(`${FIRESTORE_URL}/userProfiles/${encodeURIComponent(user.localId)}?key=${firebaseConfig.apiKey}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.idToken}` },
    body: JSON.stringify({ fields: {
      uid: firestoreString(user.localId),
      name: firestoreString(displayName),
      email: firestoreString(user.email),
      role: firestoreString("user")
    }})
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "Account created, but profile could not be saved. Check Firestore rules.");
  }
}

function routeByRole(role) {
  window.location.href = role === "admin" ? "admin.html" : "shop.html";
}

async function login(email, password) {
  const user = await authRequest("accounts:signInWithPassword", { email, password, returnSecureToken: true });
  const response = await fetch(`${FIRESTORE_URL}/userProfiles/${encodeURIComponent(user.localId)}?key=${firebaseConfig.apiKey}`, {
    headers: { Authorization: `Bearer ${user.idToken}` }
  });
  if (!response.ok) throw new Error("No user profile found. Ask the administrator to configure your account.");
  const profile = await response.json();
  const role = profile.fields?.role?.stringValue || "user";
  sessionStorage.setItem("shopEaseUser", JSON.stringify({
    uid: user.localId, email: user.email, name: profile.fields?.name?.stringValue || user.email,
    role, idToken: user.idToken, refreshToken: user.refreshToken
  }));
  routeByRole(role);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitBtn.disabled = true;
  message.className = "message";
  message.textContent = "Please wait...";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    if (mode === "signup") {
      const displayName = nameInput.value.trim();
      const user = await authRequest("accounts:signUp", { email, password, returnSecureToken: true });
      await saveCustomerProfile(user, displayName);
      sessionStorage.setItem("shopEaseUser", JSON.stringify({
        uid: user.localId, email: user.email, name: displayName, role: "user",
        idToken: user.idToken, refreshToken: user.refreshToken
      }));
      window.location.href = "shop.html";
    } else {
      await login(email, password);
    }
  } catch (error) {
    message.textContent = error.message.replaceAll("_", " ");
  } finally {
    submitBtn.disabled = false;
  }
});

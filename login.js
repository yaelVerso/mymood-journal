// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const loginBtn = loginForm.querySelector('button');
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;
        
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            // Redirect will happen automatically due to auth state change
        } catch (error) {
            alert('Login failed: ' + error.message);
            loginBtn.textContent = '🚀 Login';
            loginBtn.disabled = false;
        }
    });
    
    // Check if user is already logged in
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = 'journal.html';
        }
    });
});
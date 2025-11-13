// Register functionality
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const name = document.getElementById('registerName').value;
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        
        const registerBtn = registerForm.querySelector('button');
        registerBtn.textContent = 'Creating account...';
        registerBtn.disabled = true;
        
        try {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            // Redirect will happen automatically
        } catch (error) {
            alert('Registration failed: ' + error.message);
            registerBtn.textContent = '🌟 Create Account';
            registerBtn.disabled = false;
        }
    });
    
    // Check if user is already logged in
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = 'journal.html';
        }
    });
});
// Auth Functions
function showRegister() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
}

function showLogin() {
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    try {
        const data = await loginUser(email, password);
        authToken = data.token;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showToast('Login successful! 🎉', 'success');
        showMainApp(data.user);
    } catch (error) {
        showToast('Login failed: ' + error.message, 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (!name || !email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        const data = await registerUser(name, email, password);
        authToken = data.token;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showToast('Registration successful! 🎉', 'success');
        showMainApp(data.user);
    } catch (error) {
        showToast('Registration failed: ' + error.message, 'error');
    }
}

function handleGoogleLogin() {
    showToast('Google login coming soon!', 'info');
}

function handleFacebookLogin() {
    showToast('Facebook login coming soon!', 'info');
}

function handleLinkedinLogin() {
    showToast('LinkedIn login coming soon!', 'info');
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authToken = null;
    showToast('Logged out successfully', 'info');
    showAuthScreen();
}

function showMainApp(user) {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
    
    // Update user info
    document.getElementById('userName').textContent = user.name || 'User';
    document.getElementById('userLevel').textContent = user.level || 1;
    document.getElementById('profileName').textContent = user.name || 'User';
    document.getElementById('profileEmail').textContent = user.email || 'user@email.com';
    
    // Load data
    loadDashboard();
    loadWorkouts();
    loadExercises();
    loadProgress();
    loadProfile();
}

function showAuthScreen() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('mainScreen').classList.add('hidden');
}

// Toast Notification
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#ff4444' : '#ff6b35'};
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        animation: slideUp 0.3s ease;
        max-width: 90%;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation style
const style = document.createElement('style');
style.textContent = `

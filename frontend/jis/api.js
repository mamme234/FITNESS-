// API Configuration
const API_BASE = 'https://fitness-v5qd.onrender.com/api/v1';

// Store token
let authToken = localStorage.getItem('token');

// API Helper
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    const data = await response.json();
    
    if (!response.ok) {
        if (response.status === 401) {
            // Token expired
            localStorage.removeItem('token');
            window.location.reload();
        }
        throw new Error(data.error || 'API Error');
    }

    return data;
}

// Auth APIs
async function registerUser(name, email, password) {
    return apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    });
}

async function loginUser(email, password) {
    return apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

// User APIs
async function getProfile() {
    return apiCall('/users/profile');
}

// Workout APIs
async function getTodayWorkout() {
    return apiCall('/workouts/today');
}

async function getWorkoutPrograms() {
    return apiCall('/workouts/programs');
}

async function startWorkout(workoutId) {
    return apiCall('/workouts/start', {
        method: 'POST',
        body: JSON.stringify({ workoutId })
    });
}

// Exercise APIs
async function getExercises() {
    return apiCall('/exercises');
}

async function searchExercises(query) {
    return apiCall(`/exercises/search?q=${encodeURIComponent(query)}`);
}

// Progress APIs
async function getProgressStats() {
    return apiCall('/progress/weekly-summary');
}

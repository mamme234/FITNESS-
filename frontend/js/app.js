// Navigation
document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', function() {
        const tabName = this.dataset.tab;
        navigateTo(tabName);
    });
});

function navigateTo(tabName) {
    // Update nav buttons
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-item[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Show tab panel
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`)?.classList.remove('hidden');
    
    // Load data
    switch(tabName) {
        case 'home': loadDashboard(); break;
        case 'workouts': loadWorkouts(); break;
        case 'exercises': loadExercises(); break;
        case 'progress': loadProgress(); break;
        case 'profile': loadProfile(); break;
    }
}

function toggleSidebar() {
    showToast('Sidebar coming soon!', 'info');
}

function goToProfile() {
    navigateTo('profile');
}

// Dashboard
async function loadDashboard() {
    try {
        // Load today's workout
        const workout = await getTodayWorkout();
        const container = document.getElementById('todayWorkout');
        
        if (workout && workout.workout) {
            container.innerHTML = `
                <div style="width:100%;">
                    <h4 style="color:#ff6b35;">${workout.workout.name}</h4>
                    <p style="color:#8e8ea0;font-size:14px;margin-top:4px;">
                        ${workout.workout.exercises?.length || 0} exercises • ${workout.workout.duration || 45} min
                    </p>
                    <button onclick="startWorkoutAction('${workout.workout._id}')" class="btn-small" style="margin-top:8px;">
                        Start Workout →
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="workout-placeholder">
                    <span>🏋️</span>
                    <p>No workout scheduled today</p>
                    <button onclick="loadTodayWorkout()" class="btn-small">Refresh</button>
                </div>
            `;
        }
        
        // Load stats
        const stats = await getProgressStats();
        document.getElementById('statStreak').textContent = stats.streak || 0;
        document.getElementById('statLevel').textContent = stats.level || 1;
        document.getElementById('statXp').textContent = stats.xp || 0;
        document.getElementById('statWorkouts').textContent = stats.totalWorkouts || 0;
        
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

// Workouts
async function loadWorkouts() {
    try {
        const data = await getWorkoutPrograms();
        const container = document.getElementById('workoutList');
        
        if (data && data.length > 0) {
            container.innerHTML = data.map(w => `
                <div class="list-item" onclick="startWorkoutAction('${w._id}')">
                    <div class="item-info">
                        <h4>${w.name}</h4>
                        <p>${w.difficulty || 'Intermediate'} • ${w.duration || 45} min • ${w.exercises?.length || 0} exercises</p>
                    </div>
                    <span class="item-badge">▶</span>
                </div>
            `).join('');
        } else {
            container.innerHTML = `<p style="color:#8e8ea0;text-align:center;padding:20px;">No workouts available</p>`;
        }
    } catch (error) {
        console.error('Load workouts error:', error);
    }
}

// Exercises
async function loadExercises() {
    try {
        const data = await getExercises();
        displayExercises(data.exercises || []);
    } catch (error) {
        console.error('Load exercises error:', error);
    }
}

async function searchExercises() {
    const query = document.getElementById('exerciseSearch').value.trim();
    if (!query || query.length < 2) {
        loadExercises();
        return;
    }
    
    try {
        const data = await searchExercisesApi(query);
        displayExercises(data || []);
    } catch (error) {
        console.error('Search error:', error);
    }
}

function displayExercises(exercises) {
    const container = document.getElementById('exerciseList');
    
    if (exercises && exercises.length > 0) {
        container.innerHTML = exercises.map(e => `
            <div class="list-item">
                <div class="item-info">
                    <h4>${e.name}</h4>
                    <p>${e.muscleGroup || 'Unknown'} • ${e.equipment || 'None'} • ${e.difficulty || 'Intermediate'}</p>
                </div>
                <span class="item-badge">${e.muscleGroup?.substring(0, 3) || 'All'}</span>
            </div>
        `).join('');
    } else {
        container.innerHTML = `<p style="color:#8e8ea0;text-align:center;padding:20px;">No exercises found</p>`;
    }
}

// Progress
async function loadProgress() {
    try {
        const stats = await getProgressStats();
        const container = document.getElementById('progressStats');
        container.innerHTML = `
            <div class="progress-item">
                <span class="label">Total Workouts</span>
                <span class="value">${stats.totalWorkouts || 0}</span>
            </div>
            <div class="progress-item">
                <span class="label">Minutes Worked</span>
                <span class="value">${stats.totalMinutes || 0}</span>
            </div>
            <div class="progress-item">
                <span class="label">Calories Burned</span>
                <span class="value">${stats.caloriesBurned || 0}</span>
            </div>
            <div class="progress-item">
                <span class="label">Total Volume (kg)</span>
                <span class="value">${stats.totalVolume || 0}</span>
            </div>
            <div class="progress-item">
                <span class="label">Current Streak</span>
                <span class="value">🔥 ${stats.streak || 0} days</span>
            </div>
        `;
    } catch (error) {
        console.error('Load progress error:', error);
    }
}

// Profile
async function loadProfile() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        document.getElementById('profileName').textContent = user.name || 'User';
        document.getElementById('profileEmail').textContent = user.email || 'user@email.com';
        document.getElementById('profileLevel').textContent = user.level || 1;
        document.getElementById('profileStreak').textContent = user.streak || 0;
        document.getElementById('profileXp').textContent = user.xp || 0;
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

// Start Workout
async function startWorkoutAction(workoutId) {
    try {
        const data = await startWorkout(workoutId);
        showToast('Workout started! 💪', 'success');
        console.log('Workout:', data.workout);
    } catch (error) {
        showToast('Failed to start workout: ' + error.message, 'error');
    }
}

// Refresh today's workout
async function loadTodayWorkout() {
    await loadDashboard();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        authToken = token;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.name) {
            showMainApp(user);
        }
    }
});

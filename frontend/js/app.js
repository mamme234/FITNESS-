// Tab Navigation
document.querySelectorAll('.tab-nav button').forEach(button => {
    button.addEventListener('click', function() {
        // Update active tab button
        document.querySelectorAll('.tab-nav button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Show corresponding tab panel
        const tabName = this.dataset.tab;
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.add('hidden');
        });
        document.getElementById(`tab-${tabName}`).classList.remove('hidden');
        
        // Load data for tab
        if (tabName === 'home') loadDashboard();
        if (tabName === 'workouts') loadWorkouts();
        if (tabName === 'exercises') loadExercises();
        if (tabName === 'progress') loadProgress();
        if (tabName === 'profile') loadProfile();
    });
});

// Dashboard
async function loadDashboard() {
    try {
        // Load today's workout
        const workout = await getTodayWorkout();
        const container = document.getElementById('todayWorkout');
        if (workout.workout) {
            container.innerHTML = `
                <h4>${workout.workout.name}</h4>
                <p>${workout.workout.exercises?.length || 0} exercises</p>
                <button onclick="startWorkout('${workout.workout._id}')">Start Workout</button>
            `;
        } else {
            container.innerHTML = `
                <p>No workout scheduled today</p>
                <button onclick="loadTodayWorkout()">Refresh</button>
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
        container.innerHTML = data.map(w => `
            <div class="workout-card" onclick="startWorkout('${w._id}')">
                <h4>${w.name}</h4>
                <p>${w.difficulty || 'Intermediate'} • ${w.duration || 45} min</p>
                <small>${w.exercises?.length || 0} exercises</small>
            </div>
        `).join('') || '<p>No workouts available</p>';
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
    const query = document.getElementById('exerciseSearch').value;
    if (!query || query.length < 2) {
        loadExercises();
        return;
    }
    
    try {
        const data = await searchExercises(query);
        displayExercises(data || []);
    } catch (error) {
        console.error('Search error:', error);
    }
}

function displayExercises(exercises) {
    const container = document.getElementById('exerciseList');
    container.innerHTML = exercises.map(e => `
        <div class="exercise-card">
            <h4>${e.name}</h4>
            <p>${e.muscleGroup || 'Unknown'} • ${e.equipment || 'None'}</p>
            <small>${e.difficulty || 'Intermediate'}</small>
        </div>
    `).join('') || '<p>No exercises found</p>';
}

// Progress
async function loadProgress() {
    try {
        const stats = await getProgressStats();
        const container = document.getElementById('progressStats');
        container.innerHTML = `
            <div class="stat-card">
                <span class="stat-value">${stats.totalWorkouts || 0}</span>
                <span class="stat-label">Total Workouts</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${stats.totalMinutes || 0}</span>
                <span class="stat-label">Minutes</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${stats.caloriesBurned || 0}</span>
                <span class="stat-label">Calories Burned</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${stats.totalVolume || 0}</span>
                <span class="stat-label">Total Volume (kg)</span>
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
        const container = document.getElementById('profileInfo');
        container.innerHTML = `
            <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
            <p><strong>Level:</strong> ${user.level || 1}</p>
            <p><strong>Streak:</strong> ${user.streak || 0} days</p>
        `;
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

// Start Workout
async function startWorkout(workoutId) {
    try {
        const data = await startWorkout(workoutId);
        alert('Workout started! Check console for details.');
        console.log('Workout:', data.workout);
    } catch (error) {
        alert('Failed to start workout: ' + error.message);
    }
}

// Refresh today's workout
async function loadTodayWorkout() {
    await loadDashboard();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check auth status
    const token = localStorage.getItem('token');
    if (token) {
        authToken = token;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        showMainApp(user);
    }
});

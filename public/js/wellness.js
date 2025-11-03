document.addEventListener('DOMContentLoaded', () => {
    refreshStats();
    initializeCalendars();
    startTimeUpdates();
});

function initializeCalendars() {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const grids = document.querySelectorAll('.calendar-grid');
    
    grids.forEach(grid => {
        // Add day labels
        days.forEach(day => {
            const label = document.createElement('div');
            label.className = 'calendar-day';
            label.textContent = day;
            label.style.background = '#f0f0f0';
            grid.appendChild(label);
        });

        // Add placeholder days for demo
        for (let i = 0; i < 28; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day';
            day.textContent = i + 1;
            if (Math.random() > 0.3) day.classList.add('active');
            grid.appendChild(day);
        }
    });
}

function startTimeUpdates() {
    updateTimes();
    setInterval(updateTimes, 60000); // Update every minute
}

function updateTimes() {
    const cards = document.querySelectorAll('.tracker-card');
    cards.forEach(card => {
        const stats = card.querySelector('.activity-stats');
        if (!stats) return;

        const now = new Date();
        const hour = now.getHours();
        
        // Update time remaining to reach daily goal
        const timeLeft = document.createElement('p');
        timeLeft.className = 'time-remaining';
        timeLeft.textContent = `${24 - hour} hours left today`;
        
        // Replace or append
        const existing = stats.querySelector('.time-remaining');
        if (existing) existing.remove();
        stats.appendChild(timeLeft);
    });
}

async function refreshStats() {
    try {
        const res = await fetch('/api/wellness/stats');
        const stats = await res.json();
        
        Object.entries(stats).forEach(([activity, data]) => {
            updateProgress(activity, data);
            updateStats(activity, data);
        });
    } catch (err) {
        console.error('Failed to fetch stats:', err);
    }
}

function updateProgress(activity, stats) {
    const card = document.querySelector(`[data-activity="${activity}"]`);
    if (!card) return;

    const percent = Math.min(100, Math.round((stats.total / stats.goal) * 100));
    const circle = card.querySelector('.progress-circle');
    const text = card.querySelector('.progress-text');

    circle.style.setProperty('--progress', `${percent * 3.6}deg`);
    text.textContent = `${percent}%`;

    // Update streak badge with animation if changed
    const streak = stats.streak || 0;
    const badge = card.querySelector('.streak-badge');
    if (badge) {
        const oldStreak = parseInt(badge.textContent.match(/\d+/)[0]);
        if (oldStreak !== streak) {
            badge.classList.add('streak-updated');
            setTimeout(() => badge.classList.remove('streak-updated'), 1000);
        }
        badge.textContent = `🔥 ${streak} day streak!`;
    }
}

function updateStats(activity, stats) {
    const card = document.querySelector(`[data-activity="${activity}"]`);
    if (!card) return;

    const statsDiv = card.querySelector('.activity-stats');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <p>Daily Goal: ${stats.goal} minutes</p>
            <p>Today: ${stats.total} minutes</p>
            <p>This Week: ${stats.weekTotal} minutes</p>
        `;
    }
}

function trackActivity(type) {
    document.getElementById('activityType').value = type;
    const modal = new bootstrap.Modal(document.getElementById('trackModal'));
    modal.show();
}

async function saveActivity() {
    const type = document.getElementById('activityType').value;
    const duration = document.getElementById('duration').value;
    const notes = document.getElementById('notes').value;

    try {
        const res = await fetch('/api/wellness/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, duration, notes })
        });
        
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('trackModal')).hide();
            refreshStats();
        }
    } catch (err) {
        console.error('Failed to save activity:', err);
    }
}
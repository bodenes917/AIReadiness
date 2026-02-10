// Password protection for weekly pages
const PASSWORDS = {
    'week1': 'learner2024',
    'week2': 'learner2024',
    'week3': 'learner2024',
    'week4': 'learner2024',
    'week5': 'learner2024'
};

// ===== PROGRESS TRACKING SYSTEM =====

// Initialize progress data
function initializeProgress() {
    if (!localStorage.getItem('aiReadinessProgress')) {
        const initialProgress = {
            unlockedWeeks: [],
            completedWeeks: [],
            weekProgress: {
                week1: 0,
                week2: 0,
                week3: 0,
                week4: 0,
                week5: 0
            },
            lastVisit: new Date().toISOString(),
            streakCount: 1,
            startDate: new Date().toISOString()
        };
        localStorage.setItem('aiReadinessProgress', JSON.stringify(initialProgress));
    }
    return JSON.parse(localStorage.getItem('aiReadinessProgress'));
}

// Get progress data
function getProgress() {
    return JSON.parse(localStorage.getItem('aiReadinessProgress') || '{}');
}

// Save progress data
function saveProgress(progressData) {
    localStorage.setItem('aiReadinessProgress', JSON.stringify(progressData));
}

// Mark week as unlocked
function unlockWeek(weekNumber) {
    const progress = getProgress();
    if (!progress.unlockedWeeks.includes(`week${weekNumber}`)) {
        progress.unlockedWeeks.push(`week${weekNumber}`);
        saveProgress(progress);
    }
}

// Mark week as completed
function completeWeek(weekNumber) {
    const progress = getProgress();
    const weekKey = `week${weekNumber}`;

    // Check if already completed
    if (progress.completedWeeks && progress.completedWeeks.includes(weekKey)) {
        alert('You\'ve already completed this week!');
        return;
    }

    // Mark as completed
    if (!progress.completedWeeks) {
        progress.completedWeeks = [];
    }
    if (!progress.completedWeeks.includes(weekKey)) {
        progress.completedWeeks.push(weekKey);
    }
    progress.weekProgress[weekKey] = 100;
    saveProgress(progress);

    // Disable the button
    const button = document.querySelector('.complete-week-btn');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-check-circle"></i> Week Completed!';
        button.style.opacity = '0.6';
        button.style.cursor = 'not-allowed';
    }

    // Show completion badge
    showCompletionBadge(weekNumber);

    // Check if all weeks complete - show certificate prompt
    setTimeout(function() {
        const overallProgress = calculateOverallProgress();
        if (overallProgress === 100) {
            setTimeout(function() {
                if (confirm('Congratulations! You\'ve completed all 5 weeks!\n\nWould you like to download your certificate now?')) {
                    generateCertificate();
                }
            }, 3500);
        }
    }, 1000);
}

// Update week progress (0-100)
function updateWeekProgress(weekNumber, percentage) {
    const progress = getProgress();
    progress.weekProgress[`week${weekNumber}`] = Math.min(100, Math.max(0, percentage));
    saveProgress(progress);
}

// Calculate overall progress
function calculateOverallProgress() {
    const progress = getProgress();
    const weekProgresses = Object.values(progress.weekProgress || {});
    if (weekProgresses.length === 0) return 0;
    const total = weekProgresses.reduce((sum, val) => sum + val, 0);
    return Math.round(total / weekProgresses.length);
}

// Update streak
function updateStreak() {
    const progress = getProgress();
    const now = new Date();
    const lastVisit = new Date(progress.lastVisit);
    const hoursDiff = (now - lastVisit) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
        // Same day or within 24 hours - maintain streak
        progress.streakCount = progress.streakCount || 1;
    } else if (hoursDiff < 48) {
        // Next day - increment streak
        progress.streakCount = (progress.streakCount || 0) + 1;
    } else {
        // Streak broken - reset
        progress.streakCount = 1;
    }
    
    progress.lastVisit = now.toISOString();
    saveProgress(progress);
}

// Export progress as JSON
function exportProgress() {
    const progress = getProgress();
    const dataStr = JSON.stringify(progress, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-readiness-sprint-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Reset all progress
function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        localStorage.removeItem('aiReadinessProgress');
        location.reload();
    }
}

// ===== COMPLETION BADGE =====
function showCompletionBadge(weekNumber) {
    const badge = document.createElement('div');
    badge.className = 'completion-badge-popup';
    badge.innerHTML = `
        <div class="badge-content">
            <div class="badge-icon">🎉</div>
            <h3>Week ${weekNumber} Complete!</h3>
            <p>Great work! You're building the muscle.</p>
        </div>
    `;
    document.body.appendChild(badge);
    
    setTimeout(() => {
        badge.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        badge.classList.remove('show');
        setTimeout(() => badge.remove(), 300);
    }, 3000);
}

// ===== CERTIFICATE GENERATION =====
function generateCertificate() {
    const progress = getProgress();
    const overallProgress = calculateOverallProgress();
    
    if (overallProgress < 100) {
        alert('Complete all 5 weeks to generate your certificate!');
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // White certificate box
    ctx.fillStyle = 'white';
    ctx.fillRect(100, 100, 1000, 600);
    
    // Border
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 10;
    ctx.strokeRect(120, 120, 960, 560);
    
    // Text
    ctx.fillStyle = '#2d2d2d';
    ctx.font = 'bold 48px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', 600, 220);
    
    ctx.font = '32px -apple-system, sans-serif';
    ctx.fillText('AI Readiness Sprint', 600, 300);
    
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('This certifies that you have successfully completed', 600, 380);
    ctx.fillText('all 5 weeks of the AI Readiness Sprint', 600, 420);
    
    const completionDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    ctx.fillText(`Completed on ${completionDate}`, 600, 520);
    
    // Badge
    ctx.fillStyle = '#667eea';
    ctx.beginPath();
    ctx.arc(600, 600, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('✓', 600, 615);
    
    // Download
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'AI-Readiness-Sprint-Certificate.png';
        link.click();
    });
}

// ===== PASSWORD PROTECTION =====
function checkPassword(weekNumber) {
    const passwordKey = `week${weekNumber}`;
    const storedPassword = localStorage.getItem('pwd_' + passwordKey);

    if (storedPassword === PASSWORDS[passwordKey]) {
        unlockWeek(weekNumber);
        return true;
    }
    return false;
}

function showPasswordPrompt(weekNumber, weekTitle) {
    const overlay = document.createElement('div');
    overlay.className = 'password-overlay';
    overlay.id = 'password-overlay';
    
    overlay.innerHTML = `
        <div class="password-modal">
            <h2>Week ${weekNumber}: ${weekTitle}</h2>
            <p>Enter the password to unlock this week's content</p>
            <form id="password-form">
                <input 
                    type="password" 
                    id="password-input" 
                    class="password-input" 
                    placeholder="Enter password"
                    autocomplete="off"
                >
                <button type="submit" class="password-submit">Unlock Week ${weekNumber}</button>
                <div class="password-error" id="password-error">
                    Incorrect password. Please try again.
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.getElementById('password-input').focus();
    
    document.getElementById('password-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const input = document.getElementById('password-input').value;
        const passwordKey = `week${weekNumber}`;
        
        if (input === PASSWORDS[passwordKey]) {
            localStorage.setItem('pwd_' + passwordKey, input);
            unlockWeek(weekNumber);
            overlay.remove();
            revealContent();
        } else {
            document.getElementById('password-error').classList.add('show');
            document.getElementById('password-input').value = '';
            document.getElementById('password-input').focus();
        }
    });
}

function revealContent() {
    const content = document.querySelector('.week-content');
    if (content) {
        content.style.display = 'block';
    }
}

function hideContent() {
    const content = document.querySelector('.week-content');
    if (content) {
        content.style.display = 'none';
    }
}

// Initialize password check on page load for weekly pages
document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress tracking
    initializeProgress();
    updateStreak();

    // Only check password on actual week pages (data-week on <body>, not on card elements)
    const body = document.body;
    if (body.hasAttribute('data-week')) {
        const weekNumber = body.getAttribute('data-week');
        const weekTitle = body.getAttribute('data-week-title');

        if (!checkPassword(weekNumber)) {
            hideContent();
            showPasswordPrompt(weekNumber, weekTitle);
        } else {
            revealContent();
        }
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== SOCIAL SHARING FUNCTIONS =====

function shareWeekCompletion(weekNumber, platform) {
    const weekTitles = {
        1: "The Learner's Posture",
        2: "Experiment Like You Mean It",
        3: "Learning Out Loud",
        4: "Integration & Consolidation",
        5: "Your New Operating System"
    };
    
    const text = `Just completed Week ${weekNumber}: ${weekTitles[weekNumber]} of the AI Readiness Sprint! 🚀 #AILearning #ProfessionalDevelopment`;
    const url = window.location.origin;
    
    if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    } else if (platform === 'linkedin') {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedinUrl, '_blank', 'width=600,height=600');
    }
}

function shareSprintCompletion(platform) {
    const text = `🎉 I just completed the entire AI Readiness Sprint! 5 weeks of learning agility, iteration, and workflow transformation. #AILearning #ProfessionalDevelopment #Upskilling`;
    const url = window.location.origin;
    
    if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    } else if (platform === 'linkedin') {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedinUrl, '_blank', 'width=600,height=600');
    }
}

function shareToTwitter() {
    const progress = getProgress();
    const completedCount = progress.completedWeeks ? progress.completedWeeks.length : 0;
    const text = `Making progress on the AI Readiness Sprint! ${completedCount}/5 weeks completed. Building the muscle for AI-powered work. 🚀 #AILearning`;
    const url = window.location.origin;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
}

function shareToLinkedIn() {
    const url = window.location.origin;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=600');
}

function copyShareLink() {
    const url = window.location.origin;
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
    });
}

// ===== HOMEPAGE DASHBOARD UPDATE =====

function updateDashboard() {
    const progress = getProgress();
    
    // Update stats
    const overallProgress = calculateOverallProgress();
    const completedCount = progress.completedWeeks ? progress.completedWeeks.length : 0;
    const unlockedCount = progress.unlockedWeeks ? progress.unlockedWeeks.length : 0;
    const streak = progress.streakCount || 0;
    
    // Update DOM elements
    const totalProgressEl = document.getElementById('totalProgress');
    const unlockedWeeksEl = document.getElementById('unlockedWeeks');
    const streakEl = document.getElementById('streak');
    const progressPercentEl = document.getElementById('progressPercent');
    const overallProgressBar = document.getElementById('overallProgressBar');
    
    if (totalProgressEl) totalProgressEl.textContent = `${overallProgress}%`;
    if (unlockedWeeksEl) unlockedWeeksEl.textContent = `${unlockedCount}/5`;
    if (streakEl) streakEl.textContent = `${streak}`;
    if (progressPercentEl) progressPercentEl.textContent = `${overallProgress}%`;
    if (overallProgressBar) overallProgressBar.style.width = `${overallProgress}%`;
    
    // Update week card progress bars
    for (let i = 1; i <= 5; i++) {
        const weekProgress = progress.weekProgress[`week${i}`] || 0;
        const progressBar = document.querySelector(`[data-week-progress="${i}"]`);
        const progressText = document.querySelector(`[data-week-text="${i}"]`);
        
        if (progressBar) progressBar.style.width = `${weekProgress}%`;
        if (progressText) progressText.textContent = `${weekProgress}%`;
    }
    
    // Show certificate button if 100% complete
    const certificateBtn = document.getElementById('certificateBtn');
    if (certificateBtn && overallProgress === 100) {
        certificateBtn.style.display = 'inline-flex';
    }
    
    // Show social share section if any week completed
    const socialShareSection = document.getElementById('socialShareSection');
    if (socialShareSection && completedCount > 0) {
        socialShareSection.style.display = 'block';
    }
}


// Initialize dashboard on homepage load
if (window.location.pathname.indexOf('index') !== -1 || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(updateDashboard, 100);
    });
}


// Check if week is already completed on page load
function checkWeekCompletion() {
    const body = document.body;
    if (body.hasAttribute('data-week')) {
        const weekNumber = body.getAttribute('data-week');
        const progress = getProgress();
        const weekKey = `week${weekNumber}`;

        if (progress.completedWeeks && progress.completedWeeks.includes(weekKey)) {
            // Disable the complete button
            const button = document.querySelector('.complete-week-btn');
            if (button) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-check-circle"></i> Week Completed!';
                button.style.opacity = '0.6';
                button.style.cursor = 'not-allowed';
            }
        }
    }
}

// Run check on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(checkWeekCompletion, 100);
});

// Listen for progress updates from other windows
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'updateProgress') {
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
    }
});


// Auto-refresh dashboard when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && typeof updateDashboard === 'function') {
        updateDashboard();
    }
});

// Refresh dashboard when window gains focus
window.addEventListener('focus', function() {
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
});

// ===== TRACK SELECTOR (IC vs Leader) =====
function initTrackSelector() {
    var tracksContainer = document.querySelector('.tracks-container');
    if (!tracksContainer) return;

    var trackCards = tracksContainer.querySelectorAll('.track-card');
    if (trackCards.length < 2) return;

    // Create selector
    var selector = document.createElement('div');
    selector.className = 'track-selector';
    selector.innerHTML =
        '<p class="track-selector-label">Choose your track:</p>' +
        '<div class="track-selector-buttons">' +
            '<button class="track-selector-btn" data-track="ic">' +
                '<span class="track-selector-icon">&#x1F9D1;&#x200D;&#x1F4BC;</span> Individual Contributor' +
            '</button>' +
            '<button class="track-selector-btn" data-track="leader">' +
                '<span class="track-selector-icon">&#x1F454;</span> Leader' +
            '</button>' +
        '</div>';

    tracksContainer.parentNode.insertBefore(selector, tracksContainer);

    // Load saved preference
    var savedTrack = localStorage.getItem('sprintTrack');
    if (savedTrack) {
        applyTrackSelection(savedTrack, trackCards, selector);
    }

    // Handle clicks
    var buttons = selector.querySelectorAll('.track-selector-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function() {
            var track = this.getAttribute('data-track');
            localStorage.setItem('sprintTrack', track);
            applyTrackSelection(track, trackCards, selector);
        });
    }
}

function applyTrackSelection(track, trackCards, selector) {
    // Update button states
    var buttons = selector.querySelectorAll('.track-selector-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
        if (buttons[i].getAttribute('data-track') === track) {
            buttons[i].classList.add('active');
        }
    }

    // Show/hide tracks
    if (track === 'ic') {
        trackCards[0].style.display = 'block';
        trackCards[1].style.display = 'none';
    } else {
        trackCards[0].style.display = 'none';
        trackCards[1].style.display = 'block';
    }
}

// ===== COPY TO CLIPBOARD FOR EKO PROMPTS =====
function initCopyButtons() {
    var starterTexts = document.querySelectorAll('.starter-text');
    for (var i = 0; i < starterTexts.length; i++) {
        var text = starterTexts[i];
        var btn = document.createElement('button');
        btn.className = 'copy-prompt-btn';
        btn.innerHTML = '<i class="fas fa-copy"></i> Copy Prompt';
        btn.setAttribute('data-text', text.textContent.trim());
        btn.addEventListener('click', function() {
            var self = this;
            var promptText = self.getAttribute('data-text');
            navigator.clipboard.writeText(promptText).then(function() {
                self.innerHTML = '<i class="fas fa-check"></i> Copied!';
                self.classList.add('copied');
                setTimeout(function() {
                    self.innerHTML = '<i class="fas fa-copy"></i> Copy Prompt';
                    self.classList.remove('copied');
                }, 2000);
            }).catch(function() {
                // Fallback for older browsers
                var textarea = document.createElement('textarea');
                textarea.value = promptText;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                self.innerHTML = '<i class="fas fa-check"></i> Copied!';
                self.classList.add('copied');
                setTimeout(function() {
                    self.innerHTML = '<i class="fas fa-copy"></i> Copy Prompt';
                    self.classList.remove('copied');
                }, 2000);
            });
        });
        text.parentNode.insertBefore(btn, text.nextSibling);
    }
}

// Initialize UX enhancements on week pages
document.addEventListener('DOMContentLoaded', function() {
    if (document.body.hasAttribute('data-week')) {
        initTrackSelector();
        initCopyButtons();
    }
});


// Main Journal App
class MoodJournal {
    constructor() {
        this.selectedMood = null;
        this.currentUser = null;
        this.init();
        this.initMoodSelection();
    }

    /* ------------------ Initialization ------------------ */
    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.setDefaultDate();
    }

    checkAuth() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                document.getElementById('userName').textContent = user.email.split('@')[0];
                this.loadMoodHistory();
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        firebase.auth().signOut();
    }); 

    // Mood selection
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            this.selectMood(e.target);
        });
    });

    // Form submission
    const moodForm = document.getElementById('moodForm'); // NOW IT EXISTS
    if (moodForm) { // Added check
        moodForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEntry();
        });
    }
}

    // Uncomment this if you want the date to auto-set to today
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = today;
        }
    }

    /* ------------------ Mood Selection ------------------ */
    selectMood(button) {
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        this.selectedMood = button.dataset.mood;
    }

    async saveEntry() {
        if (!this.currentUser) {
            alert('Please log in to save entries');
            return;
        }

        const date = document.getElementById('date').value;
        const note = document.getElementById('note').value;

        if (!this.selectedMood) {
            alert('Please select a mood!');
            return;
        }

        if (!note.trim()) {
            alert('Please write a journal entry!');
            return;
        }

        const entry = {
            date: date,
            mood: this.selectedMood,
            note: note.trim(),
            timestamp: new Date().toISOString(),
            userId: this.currentUser.uid
        };

        try {
            await firebase.firestore().collection('moodEntries').add(entry);
            
            // Reset form
            document.getElementById('moodForm').reset();
            document.querySelectorAll('.mood-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.selectedMood = null;
            this.setDefaultDate();

            this.loadMoodHistory();
            alert('Entry saved successfully! ✨');
        } catch (error) {
            console.error('Error saving entry:', error);
            alert('Error saving entry. Please try again.');
        }
    }

    async loadMoodHistory() {
        if (!this.currentUser) return;

        try {
            const snapshot = await firebase.firestore()
                .collection('moodEntries')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('timestamp', 'desc')
                .get();
            
            const entries = [];
            snapshot.forEach(doc => {
                entries.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.displayMoodHistory(entries);
            this.displayMoodSummary(entries);
        } catch (error) {
            console.error('Error loading entries:', error);
        }
    }

    displayMoodHistory(entries) {
        const historyContainer = document.getElementById('moodHistory');
        
        if (entries.length === 0) {
            historyContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No entries yet. Start by adding your first mood entry!</p>';
            return;
        }

        historyContainer.innerHTML = entries.map(entry => `
            <div class="mood-entry">
                <div class="mood-emoji">${this.getMoodEmoji(entry.mood)}</div>
                <div class="entry-content">
                    <div class="entry-date">${this.formatDate(entry.date)}</div>
                    <div class="entry-note">${entry.note}</div>
                </div>
                <button class="delete-btn" onclick="moodJournal.deleteEntry('${entry.timestamp}')">🗑️</button>
            </div>
        `).join('');
    }

    displayMoodSummary(entries) {
        const moodCounts = {};
        entries.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });

        const summaryContainer = document.getElementById('moodSummary');
        summaryContainer.innerHTML = Object.entries(moodCounts).map(([mood, count]) => `
            <div class="mood-summary-item">
                <div class="mood-emoji">${this.getMoodEmoji(mood)}</div>
                <div class="mood-count">${count}</div>
                <div class="mood-label">${mood}</div>
            </div>
        `).join('');
    }

    async deleteEntry(id) { 
    if (!this.currentUser) return;

    if (confirm('Are you sure you want to delete this entry?')) {
        try {
            await firebase.firestore().collection('moodEntries').doc(id).delete();
            this.loadMoodHistory();
            alert('Entry deleted successfully!');
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Error deleting entry. Please try again.');
        }
    }
}

    /* ------------------ Utilities ------------------ */
    getMoodEmoji(mood) {
        const emojiMap = {
            'Happy': '😄',
            'Sad': '😢',
            'Tired': '😴',
            'Stressed': '😤',
            'Excited': '🤩',
            'Calm': '😌'
        };
        return emojiMap[mood] || '😐';
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    resetForm() {
        document.getElementById('note').value = '';
        document.getElementById('date').value = '';
        document.querySelectorAll('.mood-container div').forEach(c => c.classList.remove('active'));
        this.selectedMood = null;
    }
}

/* ------------------ Extra Utility Functions ------------------ */
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function displayCurrentDate() {
    const today = new Date();
    const options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    };
    const formattedDate = today.toLocaleDateString('en-US', options);
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = formattedDate;
    }
}

// Display current date on load
window.onload = displayCurrentDate;

/* ------------------ Initialize App ------------------ */
const moodJournal = new MoodJournal();

// Main Journal App
class MoodJournal {
    constructor() {
        this.selectedMood = null;
        this.currentUser = null;
        this.init();
    }

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
                window.location.href = 'index.html';
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
        document.getElementById('moodForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEntry();
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

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
                <button class="delete-btn" onclick="moodJournal.deleteEntry('${entry.id}')">🗑️ Delete</button>
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

    async deleteEntry(entryId) {
        if (confirm('Are you sure you want to delete this entry?')) {
            try {
                await firebase.firestore().collection('moodEntries').doc(entryId).delete();
                this.loadMoodHistory();
            } catch (error) {
                console.error('Error deleting entry:', error);
                alert('Error deleting entry. Please try again.');
            }
        }
    }

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

    formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
}

// Initialize the app
const moodJournal = new MoodJournal();
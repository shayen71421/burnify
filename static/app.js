// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyDeJo4yKyCFdAm27B1dxM_2IJVYqZmBNf4",
    authDomain: "toast-443b1.firebaseapp.com",
    projectId: "toast-443b1",
    storageBucket: "toast-443b1.appspot.com",
    messagingSenderId: "182128989658",
    appId: "1:182128989658:web:efeddd5831e980b4cc1ce3"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// Save result to Firestore, with user name
function saveToastResult(name, brightness, rating) {
    return db.collection("toasts").add({
        name,
        brightness,
        rating,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Load leaderboard (top 3 brightest and darkest, show name and score)
function loadLeaderboard() {
    // Brightest
    db.collection("toasts").orderBy("brightness", "desc").limit(3).get().then(snapshot => {
        const ul = document.querySelector('#brightestList ul');
        ul.innerHTML = '';
        snapshot.forEach(doc => {
            const d = doc.data();
            ul.innerHTML += `<li>${d.name || 'Anonymous'}: ${d.rating} (${d.brightness})</li>`;
        });
    });
    // Darkest
    db.collection("toasts").orderBy("brightness", "asc").limit(3).get().then(snapshot => {
        const ul = document.querySelector('#darkestList ul');
        ul.innerHTML = '';
        snapshot.forEach(doc => {
            const d = doc.data();
            ul.innerHTML += `<li>${d.name || 'Anonymous'}: ${d.rating} (${d.brightness})</li>`;
        });
    });
}
const appCard = document.getElementById('appCard');
const uploadForm = document.getElementById('uploadForm');
const resultDiv = document.getElementById('result');
const backBtn = document.getElementById('backBtn');
const dontPressBtn = document.getElementById('dontPressBtn');
const shareBtn = document.getElementById('shareBtn');
const uselessMsg = document.getElementById('uselessMsg');
const toastCounterDiv = document.getElementById('toastCounter');
const toastMoodDiv = document.getElementById('toastMood');
const toastFactDiv = document.getElementById('toastFact');


let toastCounter = 0;
// Fetch total toast count from Firestore
function updateToastCounter() {
    db.collection("toasts").get().then(snapshot => {
        toastCounter = snapshot.size;
        toastCounterDiv.textContent = `Toasts Analyzed: ${toastCounter}`;
    });
}

const toastFacts = [
    "The word 'toast' comes from the Latin 'tostare', meaning 'to roast'.",
    "The first electric toaster was invented in 1893!",
    "Some people like their toast with just butter, others with jam, and some with... peanut butter and pickles?",
    "In the UK, 'toast racks' are a thing.",
    "Burnt toast contains more carbon than regular toast. Science!",
    "The world's largest piece of toast was over 10 feet long.",
    "Toast is a classic breakfast food, but also a midnight snack.",
    "Some toasters have a 'bagel' setting. Why not a 'crumpet' setting?",
    "If you drop toast, it usually lands butter-side down. It's science (or bad luck)!",
    "In 2001, a piece of toast with the image of the Virgin Mary sold for $28,000."
];
const toastMoods = {
    "Pale Bread": "😐",
    "Perfectly Toasted": "😋",
    "Slightly Burnt": "😬",
    "Carbonized": "🔥"
};




uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const nameInput = document.getElementById('userName');
    const name = nameInput.value.trim() || 'Anonymous';
    const imageInput = document.getElementById('toastImage');
    const file = imageInput.files[0];
    resultDiv.textContent = 'Analyzing...';
    toastMoodDiv.textContent = '';
    toastFactDiv.textContent = '';
    appCard.classList.add('flipped');
    if (!file) {
        resultDiv.innerHTML = `<span style='color:#b94a48;'>Please select an image file.</span>`;
        return;
    }
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userName', name);
    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.error) {
            resultDiv.innerHTML = `<span style='color:#b94a48;'>Error: ${data.error}</span>`;
            toastMoodDiv.textContent = '';
            toastFactDiv.textContent = '';
        } else {
            resultDiv.innerHTML = `<strong>Rating:</strong> <span style='color:#a67c52;'>${data.rating}</span><br><strong>Brightness:</strong> <span style='color:#e2b97f;'>${data.brightness}</span>`;
            toastMoodDiv.textContent = toastMoods[data.rating] || '';
            toastFactDiv.textContent = toastFacts[Math.floor(Math.random() * toastFacts.length)];
            // Save to Firestore and update leaderboard and counter
            saveToastResult(name, data.brightness, data.rating).then(() => {
                loadLeaderboard();
                updateToastCounter();
            });
        }
    } catch (err) {
        resultDiv.innerHTML = `<span style='color:#b94a48;'>An error occurred.</span>`;
        toastMoodDiv.textContent = '';
        toastFactDiv.textContent = '';
    }
});

// Load leaderboard on page load
// Load leaderboard and counter on page load
window.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    updateToastCounter();
});

backBtn.addEventListener('click', function() {
    appCard.classList.remove('flipped');
    uploadForm.reset();
    resultDiv.textContent = '';
    toastMoodDiv.textContent = '';
    toastFactDiv.textContent = '';
});
// END

dontPressBtn.addEventListener('click', function() {
    const messages = [
        "I told you not to press it!",
        "Seriously, stop pressing this button.",
        "Nothing will happen. Or will it?",
        "You pressed it again?!",
        "This button is 100% useless.",
        "Toast is judging you right now..."
    ];
    uselessMsg.textContent = messages[Math.floor(Math.random() * messages.length)];
});

shareBtn.addEventListener('click', function() {
    uselessMsg.textContent = "Feature coming soon! (Not really.)";
});

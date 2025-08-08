// leaderboard.js
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

function updateToastCounter() {
    db.collection("toasts").get().then(snapshot => {
        document.getElementById('toastCounter').textContent = `Toasts Analyzed: ${snapshot.size}`;
    });
}

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

window.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    updateToastCounter();
});

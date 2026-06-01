import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCWXHl3lmKweo6F9HlF2eBH0qzDA4a8X9w",
    authDomain: "snipix-c0737.firebaseapp.com",
    projectId: "snipix-c0737",
    storageBucket: "snipix-c0737.firebasestorage.app",
    messagingSenderId: "154174697325",
    appId: "1:154174697325:web:cc106f3a80f673ec817464",
    measurementId: "G-M11W1QZ3TK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const tableBody = document.getElementById('bookingsTableBody');

// Email Modal Elements
const emailModal = document.getElementById('emailModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const emailForm = document.getElementById('emailForm');
const emailToAddress = document.getElementById('emailToAddress');
const emailToDisplay = document.getElementById('emailToDisplay');
const emailSubject = document.getElementById('emailSubject');
const emailMessage = document.getElementById('emailMessage');
const emailError = document.getElementById('emailError');
const sendEmailBtn = document.getElementById('sendEmailBtn');

// Sidebar Config Elements
const adminSecretInput = document.getElementById('adminSecretInput');
const toggleSecretBtn = document.getElementById('toggleSecretBtn');

// --- Secret Storage Logic ---
if (adminSecretInput) {
    // Load from localStorage
    const savedSecret = localStorage.getItem('snipix_admin_secret') || '';
    adminSecretInput.value = savedSecret;

    // Save to localStorage on input
    adminSecretInput.addEventListener('input', () => {
        localStorage.setItem('snipix_admin_secret', adminSecretInput.value);
    });
}

if (toggleSecretBtn && adminSecretInput) {
    toggleSecretBtn.addEventListener('click', () => {
        const isPassword = adminSecretInput.type === 'password';
        adminSecretInput.type = isPassword ? 'text' : 'password';
        
        const icon = toggleSecretBtn.querySelector('i');
        if (icon) {
            icon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
        }
    });
}

// --- Auth Listener ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
        loadBookings();
    } else {
        loginScreen.classList.remove('hidden');
        dashboardScreen.classList.add('hidden');
    }
});

// --- Login Logic ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        
        loginBtn.innerHTML = '<span class="btn-text">AUTHENTICATING...</span><span class="btn-icon"><i class="fa-solid fa-spinner fa-spin"></i></span>';
        loginBtn.disabled = true;
        loginError.textContent = '';

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            loginError.textContent = "Access Denied: Invalid credentials.";
        } finally {
            loginBtn.innerHTML = '<span class="btn-text">AUTHENTICATE</span><span class="btn-icon"><i class="fa-solid fa-arrow-right"></i></span>';
            loginBtn.disabled = false;
        }
    });
}

// --- Logout Logic ---
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth);
    });
}

// --- Dashboard Logic ---
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        loadBookings();
    });
}

async function loadBookings() {
    tableBody.innerHTML = '<tr><td colspan="5" class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> Loading secured data...</td></tr>';
    
    try {
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        
        tableBody.innerHTML = '';
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="5" class="loading-state">No bookings found in the database.</td></tr>';
            return;
        }

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            const tr = document.createElement('tr');
            
            const status = data.status || 'pending';
            
            let statusBadgeClass = 'status-pending';
            if (status === 'accepted') statusBadgeClass = 'status-accepted';
            if (status === 'rejected') statusBadgeClass = 'status-rejected';

            tr.innerHTML = `
                <td class="date-time">
                    ${data.date}
                    <span>${data.time}</span>
                </td>
                <td class="client-info">
                    <strong>${data.name}</strong>
                    <a href="mailto:${data.email}">${data.email}</a>
                </td>
                <td>
                    <div class="brief-text">${data.brief}</div>
                </td>
                <td>
                    <span class="status-badge ${statusBadgeClass}">${status}</span>
                </td>
                <td class="actions-cell">
                    <button class="btn-action btn-accept" data-id="${id}" data-action="accept" title="Accept & Send Meet Link">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button class="btn-action btn-reject" data-id="${id}" data-action="reject" title="Reject / Cancel">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <button class="btn-action btn-email" data-id="${id}" data-action="email" title="Direct Email">
                        <i class="fa-regular fa-envelope"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(tr);
            
            // Attach event listeners
            tr.querySelector('.btn-accept').addEventListener('click', () => updateStatus(id, 'accepted', data));
            tr.querySelector('.btn-reject').addEventListener('click', () => updateStatus(id, 'rejected', data));
            tr.querySelector('.btn-email').addEventListener('click', () => sendDirectEmail(data));
        });

    } catch (error) {
        console.error("Error loading bookings:", error);
        tableBody.innerHTML = '<tr><td colspan="5" class="loading-state" style="color:var(--status-rejected);">Failed to load data. Check console.</td></tr>';
    }
}

async function updateStatus(id, newStatus, data) {
    // Check for Admin Secret
    const adminSecret = adminSecretInput ? adminSecretInput.value.trim() : (localStorage.getItem('snipix_admin_secret') || '').trim();
    if (!adminSecret) {
        alert("Action required: Please enter your Admin Secret Key in the sidebar configuration to authorize emails.");
        if (adminSecretInput) {
            adminSecretInput.focus();
            adminSecretInput.style.borderColor = 'var(--status-rejected)';
            setTimeout(() => { adminSecretInput.style.borderColor = ''; }, 3000);
        }
        return;
    }

    if (!confirm(`Are you sure you want to mark this booking as ${newStatus.toUpperCase()}?`)) return;

    try {
        const docRef = doc(db, "bookings", id);
        
        // Handle Vercel API Call
        if (newStatus === 'accepted') {
            await sendAcceptanceEmail(data, adminSecret);
            await updateDoc(docRef, { status: newStatus });
            
        } else if (newStatus === 'rejected') {
            await sendRejectionEmail(data, adminSecret);
            
            if (confirm("Do you want to permanently DELETE this booking from the database? (This will completely free up the time slot on the website)")) {
                await deleteDoc(docRef);
            } else {
                await updateDoc(docRef, { status: newStatus });
            }
        }
        
        // Refresh table
        loadBookings();
    } catch (error) {
        console.error("Error updating status:", error);
        alert(`Failed to update status: ${error.message}\n\nPlease check your Firestore security rules or console.`);
    }
}

// --- Vercel API Email Generators ---

async function sendAcceptanceEmail(data, adminSecret) {
    const response = await fetch('/api/send-meet-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: data.name,
            email: data.email,
            date: data.date,
            time: data.time,
            adminSecret: adminSecret
        })
    });
    
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to send acceptance email');
    }
    alert("Booking acceptance email sent to the client!");
}

async function sendRejectionEmail(data, adminSecret) {
    const response = await fetch('/api/send-rejection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: data.name,
            email: data.email,
            date: data.date,
            time: data.time,
            adminSecret: adminSecret
        })
    });
    
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to send rejection email');
    }
    alert("Rejection email sent to the client.");
}

function sendDirectEmail(data) {
    // Open Modal
    emailToAddress.value = data.email;
    emailToDisplay.value = `${data.name} (${data.email})`;
    emailSubject.value = "Snipix Studio — Consultation Call Details";
    emailMessage.value = `Hi ${data.name},\n\nHere is the Google Meet link for our consultation on ${data.date} at ${data.time}:\n\n[PASTE MEET LINK HERE]\n\nLooking forward to discussing your cinematic vision!\n\nBest regards,\nVinay Kumar\nSnipix Studio`;
    emailError.textContent = '';
    emailModal.classList.remove('hidden');
}

// --- Modal Logic ---

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        emailModal.classList.add('hidden');
    });
}

if (emailForm) {
    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check for Admin Secret
        const adminSecret = adminSecretInput ? adminSecretInput.value.trim() : (localStorage.getItem('snipix_admin_secret') || '').trim();
        if (!adminSecret) {
            alert("Action required: Please enter your Admin Secret Key in the sidebar configuration to authorize sending emails.");
            emailModal.classList.add('hidden'); // hide modal to let them enter the secret
            if (adminSecretInput) {
                adminSecretInput.focus();
                adminSecretInput.style.borderColor = 'var(--status-rejected)';
                setTimeout(() => { adminSecretInput.style.borderColor = ''; }, 3000);
            }
            return;
        }

        sendEmailBtn.innerHTML = '<span class="btn-text">SENDING...</span><span class="btn-icon"><i class="fa-solid fa-spinner fa-spin"></i></span>';
        sendEmailBtn.disabled = true;
        emailError.textContent = '';

        try {
            const response = await fetch('/api/send-custom-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailToAddress.value,
                    subject: emailSubject.value,
                    message: emailMessage.value,
                    adminSecret: adminSecret
                })
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Failed to send email');
            }
            
            alert("Email sent successfully!");
            emailModal.classList.add('hidden');
        } catch (error) {
            console.error("Error sending custom email:", error);
            emailError.textContent = `Failed to send email: ${error.message}`;
        } finally {
            sendEmailBtn.innerHTML = '<span class="btn-text">SEND EMAIL</span><span class="btn-icon"><i class="fa-regular fa-paper-plane"></i></span>';
            sendEmailBtn.disabled = false;
        }
    });
}

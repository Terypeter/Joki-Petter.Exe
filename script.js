/* ======================================================= */
/* 10. SCRIPT.JS - FUNGSI, LOGIKA, AUTENTIKASI, ANIMASI */
/* ======================================================= */

// --- 1. DATA SIMULASI (LocalStorage) ---

// Struktur Data Game dan Layanan Spesifik (Diperbarui)
const dataGame = {
    "Blox Fruit": {
        "Leveling (1 - 1000)": 50000,
        "Leveling (1000 - MAX)": 150000,
        "Farming Fragment (10k)": 25000,
        "Race v4": 200000 
    },
    "King Legacy": {
        "Leveling (1 - 1000)": 30000,
        "Farming Gems (500)": 60000,
        "Awakening Buah": 100000,
        "Farming Beli (100M)": 50000
    },
    "Fish": {
        "Farming Gold (1M)": 5000,
        "100 LEVEL": 25000,
        "Hunting Event Max 10": 20000
    },
    "Fish It": {
        // Menu Joki Spesifik Fish It
        "Dapetin Rare Rod": 50000,
        "Farming Coin (5M)": 100000,
        "Tangkap Ikan Secret (1x)": 70000 
    },
    "Steal A Brainrot": {
        "Grinding Wins (100x)": 50000,
        "Unlock Karakter (1x)": 30000,
        "Grinding Skips (100x)": 25000
    }
};

const ADMIN_ACCOUNT = {
    username: "Petter.exe",
    password: "552009",
    email: "petter.exe@joki.com",
    role: "admin"
};

// --- 2. FUNGSI UTILITY (Penting untuk Mandatory Login) ---

/**
 * Memeriksa status otentikasi. Jika belum login, redirect ke login.html.
 * Dipanggil di profile.html, order.html, setting.html, ask.html.
 */
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    // Array halaman yang wajib login
    const protectedPages = ['profile.html', 'order.html', 'setting.html', 'ask.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !user) {
        alert("Anda harus login untuk mengakses halaman ini.");
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Fungsionalitas tambahan saat halaman dimuat
function checkAuthAndLoadProfile() {
    if (checkAuth()) {
        loadProfileData();
    }
}

function checkAuthAndLoadSetting() {
    if (checkAuth()) {
        loadSettingData();
    }
}

// --- 3. AUTENTIKASI (Login, Register, Logout) ---

// Inisialisasi daftar pengguna (jika belum ada)
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([ADMIN_ACCOUNT]));
}

document.addEventListener('DOMContentLoaded', () => {
    // Jalankan checkAuth di semua halaman yang memuat script.js
    checkAuth();

    // LOGIN FORM HANDLER
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => (u.username === username || u.email === username) && u.password === password);

            if (user) {
                // Simpan user yang sedang login
                localStorage.setItem('currentUser', JSON.stringify(user));
                alert(`Selamat datang, ${user.username}!`);
                window.location.href = 'profile.html'; // Arahkan ke profile setelah login
            } else {
                alert("Username/Email atau Password salah.");
            }
        });
    }

    // REGISTER FORM HANDLER
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;

            if (password !== confirmPassword) {
                alert("Konfirmasi password tidak cocok.");
                return;
            }

            let users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.some(u => u.username === username || u.email === email)) {
                alert("Username atau Email sudah terdaftar.");
                return;
            }

            const newUser = { username, email, password, role: 'user', profilePic: 'assets/images/default-profile.jpg' };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            alert("Pendaftaran berhasil! Silakan login.");
            window.location.href = 'login.html';
        });
    }
    
    // Inisialisasi menu dinamis di order.html
    initializeOrderForm();
    
    // Inisialisasi animasi loading
    handleLoadingAnimation();
    
    // Panggil saat halaman Ask.html dimuat
    if (document.querySelector('.ask-page')) {
        loadQnaData();
    }
});

function logout() {
    localStorage.removeItem('currentUser');
    alert("Anda telah berhasil logout.");
    window.location.href = 'index.html';
}

// --- 4. ANIMASI LOADING & MUSIK ---

function handleLoadingAnimation() {
    const loadingScreen = document.getElementById('loading-screen');
    const music = document.getElementById('background-music');
    
    if (loadingScreen) {
        // Coba putar musik, jika gagal (karena user belum berinteraksi), biarkan
        if (music) {
            music.volume = 0.3; // Atur volume agar tidak terlalu keras
            music.play().catch(e => console.log("Musik tidak bisa diputar otomatis:", e));
        }

        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 1000); // Tunggu transisi selesai
        }, 2000); // Tampilkan loading selama 2 detik
    }
}


// --- 5. FUNGSI SLIDER (index.html) ---

let currentSlide = 0;
let sliderInterval;

function initSlider() {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    const slides = slider.querySelectorAll('img');
    if (slides.length === 0) return;

    function updateSlider() {
        if (currentSlide >= slides.length) {
            currentSlide = 0;
        } else if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }
        slider.style.transform = `translateX(${-currentSlide * 100}%)`;
    }

    // Fungsi untuk pindah slide (dipanggil dari tombol)
    window.moveSlider = function(n) {
        currentSlide += n;
        updateSlider();
        // Reset interval setelah interaksi manual
        clearInterval(sliderInterval);
        startSliderAutoPlay();
    }
    
    function startSliderAutoPlay() {
        sliderInterval = setInterval(() => {
            currentSlide++;
            updateSlider();
        }, 5000); // Ganti setiap 5 detik
    }
    
    updateSlider(); // Tampilkan slide pertama
    startSliderAutoPlay();
}

// Panggil inisialisasi slider setelah DOMContentLoaded (jika di index.html)
if (document.querySelector('.slider')) {
    document.addEventListener('DOMContentLoaded', initSlider);
}


// --- 6. ABOUT PAGE FUNGSI (Pembayaran QRIS/Dana/Gopay) ---

// Fungsi untuk menampilkan info pembayaran
window.showPayment = function(method) {
    const infos = document.querySelectorAll('.payment-info');
    infos.forEach(info => {
        if (info.id === `${method}-info`) {
            // Toggle display
            info.style.display = info.style.display === 'block' ? 'none' : 'block';
        } else {
            info.style.display = 'none';
        }
    });
    
    // Khusus QRIS, buka modal jika diklik
    if (method === 'qris' && document.getElementById('qris-modal')) {
        document.getElementById('qris-modal').style.display = 'block';
    }
}

// Fungsi untuk membuka/menutup Modal QRIS
window.openQrisModal = function() {
    const modal = document.getElementById('qris-modal');
    if (modal) modal.style.display = 'block';
}
window.closeQrisModal = function() {
    const modal = document.getElementById('qris-modal');
    if (modal) modal.style.display = 'none';
}

// Menutup modal jika user mengklik di luar modal
window.onclick = function(event) {
    const modal = document.getElementById('qris-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


// --- 7. PROFILE PAGE FUNGSI ---

function loadProfileData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return; // Seharusnya sudah dihandle oleh checkAuth

    document.getElementById('display-username').textContent = user.username;
    document.getElementById('display-email').textContent = user.email;
    document.getElementById('display-status').textContent = user.role === 'admin' ? 'Admin' : 'Member Premium';
    document.getElementById('profile-pic').src = user.profilePic || 'assets/images/default-profile.jpg';
    
    // Simulasi Riwayat Order (Ganti dengan data riwayat Anda)
    const historyList = document.getElementById('history-list');
    if (historyList) {
        // Contoh data dummy
        const historyData = [
            { game: "Blox Fruit", service: "Level 1 ke 1000", date: "2025-11-01", status: "Selesai" },
            { game: "King Legacy", service: "Farming Gems 1000", date: "2025-11-05", status: "Diproses" }
        ];
        
        historyList.innerHTML = '';
        if (historyData.length > 0) {
            historyData.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `[${item.date}] **${item.game}**: ${item.service} - Status: <span class="${item.status.toLowerCase()}">${item.status}</span>`;
                historyList.appendChild(li);
            });
        } else {
            historyList.innerHTML = '<li>Belum ada riwayat order.</li>';
        }
    }
}


// --- 8. SETTING PAGE FUNGSI ---

function loadSettingData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return; 

    // Isi Form Info
    document.getElementById('edit-username').value = user.username;
    document.getElementById('edit-email').value = user.email;
    
    // Set Foto Profile
    document.getElementById('setting-profile-pic').src = user.profilePic || 'assets/images/default-profile.jpg';
    
    // Update Info Handler
    const updateInfoForm = document.getElementById('updateInfoForm');
    if (updateInfoForm) {
        updateInfoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUsername = document.getElementById('edit-username').value;
            const newEmail = document.getElementById('edit-email').value;

            updateUserData({ ...user, username: newUsername, email: newEmail });
            alert("Informasi akun berhasil diupdate!");
            window.location.href = 'profile.html'; // Arahkan kembali
        });
    }


    // Change Password Handler
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const currentPass = document.getElementById('current-password').value;
            const newPass = document.getElementById('new-password').value;
            const confirmNewPass = document.getElementById('confirm-new-password').value;

            if (currentPass !== user.password) {
                alert("Password saat ini salah.");
                return;
            }
            if (newPass !== confirmNewPass) {
                alert("Konfirmasi password baru tidak cocok.");
                return;
            }
            
            updateUserData({ ...user, password: newPass });
            alert("Password berhasil diubah!");
            // Force logout/re-login untuk keamanan (opsional)
            logout(); 
        });
    }
}

// Fungsi untuk mengganti foto profile (simulasi)
window.saveProfilePicture = function() {
    const fileInput = document.getElementById('upload-profile-pic');
    if (fileInput.files.length > 0) {
        // Dalam simulasi: ganti gambar profile dengan file base64
        const reader = new FileReader();
        reader.onload = function(e) {
            const newPic = e.target.result;
            // Update tampilan di setting
            const settingPic = document.getElementById('setting-profile-pic');
            if(settingPic) settingPic.src = newPic;
            
            const user = JSON.parse(localStorage.getItem('currentUser'));
            updateUserData({ ...user, profilePic: newPic });
            alert("Foto profile berhasil diganti! Cek di halaman Profile.");
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        alert("Pilih file gambar terlebih dahulu.");
    }
}

/**
 * Memperbarui data pengguna di LocalStorage (Backend Simulasi)
 * @param {object} updatedUser Objek pengguna yang diperbarui
 */
function updateUserData(updatedUser) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.map(u => u.username === updatedUser.username ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
}


// --- 9. ORDER PAGE FUNGSI (Dinamic Menu & WA Redirect) ---

/**
 * Fungsi yang dipanggil dari index.html saat klik Order Sekarang
 */
window.goToOrder = function(gameName) {
    if (checkAuth()) {
        // Simpan nama game yang dipilih
        localStorage.setItem('preselectedGame', gameName);
        window.location.href = 'order.html';
    }
}

/**
 * Inisialisasi form order (isi menu layanan)
 */
function initializeOrderForm() {
    const gameSelect = document.getElementById('game-name');
    if (gameSelect) {
        // Isi menu Game secara dinamis
        gameSelect.innerHTML = '<option value="">Pilih Game</option>'; 
        
        Object.keys(dataGame).forEach(gameName => {
            const option = document.createElement('option');
            option.value = gameName;
            option.textContent = gameName;
            gameSelect.appendChild(option);
        });
        
        // Pilih game yang sudah di-preselect dari index.html
        const preselectedGame = localStorage.getItem('preselectedGame');
        if (preselectedGame && dataGame[preselectedGame]) {
            gameSelect.value = preselectedGame;
            localStorage.removeItem('preselectedGame');
            // Update layanan segera setelah game terpilih
            updateServiceOptions(); 
        }

        // Order Form Handler
        const orderForm = document.getElementById('orderForm');
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleOrderSubmission(orderForm);
        });
    }
}

/**
 * Memperbarui opsi Layanan Joki berdasarkan Game yang dipilih.
 * Dipanggil saat terjadi perubahan pada dropdown Game.
 */
window.updateServiceOptions = function() {
    const gameSelect = document.getElementById('game-name');
    const serviceSelect = document.getElementById('game-service');
    const selectedGame = gameSelect.value;
    
    // Reset opsi layanan
    serviceSelect.innerHTML = ''; 

    if (selectedGame && dataGame[selectedGame]) {
        serviceSelect.disabled = false;
        serviceSelect.innerHTML += '<option value="">Pilih Layanan</option>';
        
        const services = dataGame[selectedGame];
        
        // Isi dropdown layanan spesifik
        Object.keys(services).forEach(serviceName => {
            const price = services[serviceName];
            const option = document.createElement('option');
            option.value = serviceName;
            // Tambahkan harga (simulasi) di teks opsi
            option.textContent = `${serviceName} (Rp ${price.toLocaleString('id-ID')})`;
            serviceSelect.appendChild(option);
        });
    } else {
        serviceSelect.disabled = true;
        serviceSelect.innerHTML = '<option value="">Pilih game terlebih dahulu</option>';
    }
}

/**
 * Menangani pengiriman form order dan redirect ke WhatsApp.
 * @param {HTMLFormElement} form Form order
 */
function handleOrderSubmission(form) {
    const selectedGame = form['game-name'].value; 
    const selectedService = form['game-service'].value; 
    const robloxUser = form['roblox-username'].value;
    const robloxPass = form['roblox-password'].value;
    const contactEmail = form['contact-email'].value;
    const contactPhone = form['contact-phone'].value;
    const paymentMethod = form['payment-method'].value;
    const notes = form['notes'].value || 'Tidak ada catatan tambahan.';

    // Cari Harga
    // Cek apakah game dan layanan ada
    const price = (dataGame[selectedGame] && dataGame[selectedGame][selectedService]) 
                  ? dataGame[selectedGame][selectedService] 
                  : 'Hubungi Admin'; 
    
    // Link WA Redirect
    const waNumber = '6283899392700'; // Nomor Admin
    let waMessage = `Halo Admin Petter.Exe, saya ingin konfirmasi order joki:\n`;
    waMessage += `\n*Game:* ${selectedGame}`;
    waMessage += `\n*Layanan:* ${selectedService}`;
    waMessage += `\n*Estimasi Harga:* Rp ${price.toLocaleString('id-ID')}`; 
    waMessage += `\n*Username Roblox:* ${robloxUser}`;
    waMessage += `\n*Password Roblox:* (Sudah diisi di Form)`;
    waMessage += `\n*Metode Bayar:* ${paymentMethod.toUpperCase()}`;
    waMessage += `\n*Nomor Kontak:* ${contactPhone}`;
    waMessage += `\n*Catatan:* ${notes}`;
    waMessage += `\n\n(Saya sudah upload bukti transfer di form. Mohon dicek. Terima kasih!)`;

    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

    alert(`Order ${selectedService} untuk game ${selectedGame} diterima! Anda akan diarahkan ke WhatsApp untuk konfirmasi akhir.`);
    window.open(waLink, '_blank');
}


// --- 10. ASK/QNA FUNGSI (Simulasi Komen & Admin) ---

// Struktur data simulasi QnA
let qnaData = [
    { id: 1, user: "UserA", question: "Apakah bisa joki Blox Fruit sampai level 2550 dalam 3 hari?", reply: "Tergantung tier buah Anda, silakan hubungi WA untuk estimasi akurat!", replier: "Petter.Exe" },
    { id: 2, user: "UserB", question: "Berapa lama waktu joki King Legacy dari level 100 ke max level?", reply: null, replier: null }
];
let nextQnaId = 3;


function loadQnaData() {
    const qnaContainer = document.getElementById('qna-container');
    if (!qnaContainer) return;

    qnaContainer.innerHTML = '';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    qnaData.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'qna-item';
        itemDiv.dataset.id = item.id;
        
        let actionsHtml = '';
        let replyHtml = '';

        // Akses Edit/Hapus untuk pemilik pertanyaan atau Admin
        if (currentUser && (currentUser.username === item.user || currentUser.role === 'admin')) {
            actionsHtml = `
                <div class="qna-actions">
                    <button class="btn small-btn edit-btn" onclick="editQuestion('${item.id}', '${item.question}')">Edit</button>
                    <button class="btn small-btn delete-btn" onclick="deleteQuestion('${item.id}')">Hapus</button>
                </div>
            `;
        }

        // Tampilan Balasan
        if (item.reply) {
            replyHtml = `
                <div class="qna-reply">
                    <p class="admin-reply-text"><strong>${item.replier || 'Admin'}:</strong> ${item.reply}</p>
                </div>
            `;
        }

        // Admin Reply/Edit Reply (Hanya untuk Admin)
        if (currentUser && currentUser.role === 'admin') {
            const replyBtnText = item.reply ? 'Edit Balasan' : 'Balas Pertanyaan';
            replyHtml += `
                <div class="admin-reply-tools">
                    <button class="btn small-btn primary-btn" onclick="openReplyForm('${item.id}')">${replyBtnText}</button>
                </div>
            `;
        }
        
        itemDiv.innerHTML = `
            <p class="qna-question"><strong>${item.user}:</strong> ${item.question}</p>
            ${actionsHtml}
            ${replyHtml}
        `;
        
        qnaContainer.appendChild(itemDiv);
    });
    
    // Tampilkan admin panel jika user adalah admin
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanel.style.display = (currentUser && currentUser.role === 'admin') ? 'block' : 'none';
    }
}

// Fungsi untuk membuat form balasan (simulasi)
window.openReplyForm = function(id) {
    const item = qnaData.find(q => q.id == id);
    if (!item) return;

    const reply = prompt(`Balas/Edit Balasan untuk pertanyaan ID ${id} (${item.user}):`, item.reply || "");
    if (reply !== null) {
        item.reply = reply;
        item.replier = 'Petter.Exe (Admin)';
        loadQnaData(); // Refresh tampilan
        alert("Balasan disimpan!");
    }
}

// Fungsi untuk edit pertanyaan (simulasi)
window.editQuestion = function(id, currentQ) {
    const item = qnaData.find(q => q.id == id);
    if (!item) return;
    
    const newQ = prompt("Edit pertanyaan Anda:", currentQ);
    if (newQ !== null && newQ.trim() !== "") {
        item.question = newQ.trim();
        loadQnaData();
        alert("Pertanyaan berhasil diubah!");
    }
}

// Fungsi untuk hapus pertanyaan (simulasi)
window.deleteQuestion = function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus pertanyaan ini?")) {
        qnaData = qnaData.filter(q => q.id != id);
        loadQnaData();
        alert("Pertanyaan berhasil dihapus.");
    }
}

// Handler untuk form kirim pertanyaan
const askForm = document.getElementById('askForm');
if (askForm) {
    askForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const question = document.getElementById('ask-question').value;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            alert("Anda harus login untuk mengajukan pertanyaan.");
            return;
        }

        qnaData.push({ id: nextQnaId++, user: currentUser.username, question: question, reply: null, replier: null });
        document.getElementById('ask-question').value = '';
        loadQnaData();
        alert("Pertanyaan Anda berhasil dikirim!");
    });
}
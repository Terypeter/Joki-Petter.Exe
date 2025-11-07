// -------------------- Data Layanan Joki & Harga --------------------
const JOKI_PRICES = {
    'Blox Fruit': [
        { name: 'Leveling 1-1000', price: 50000 },
        { name: 'Leveling 1000-MAX', price: 75000 },
        { name: 'Farming Hati/Bounty', price: 40000 },
        { name: 'Gacha Fruit 10x', price: 25000 }
    ],
    'King Legacy': [
        { name: 'Leveling 1-MAX', price: 60000 },
        { name: 'Farming Beli 5 Juta', price: 30000 },
        { name: 'Unlock Fruit Terbaru', price: 80000 }
    ],
    'Fish': [
        { name: 'Kumpulkan 5 Ikan Langka', price: 45000 },
        { name: 'Kumpulkan 10 Ikan Biasa', price: 20000 }
    ],
    'Fish It': [
        { name: 'Event Season Pass Lengkap', price: 120000 },
    ],
    'Steal A Brainrot': [
        { name: 'Selesaikan Semua Puzzle', price: 90000 },
        { name: 'Dapatkan Item Eksklusif', price: 70000 }
    ]
};

// Fungsi utilitas untuk memuat ulang data menu navigasi
function updateNavMenu() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginLink = document.getElementById('login-link');
    const userDropdown = document.getElementById('user-dropdown');

    if (loginLink && userDropdown) {
        if (isLoggedIn) {
            loginLink.style.display = 'none';
            userDropdown.style.display = 'list-item';
        } else {
            loginLink.style.display = 'block';
            userDropdown.style.display = 'none';
        }
    }
}

// -------------------- Mandatory Login Check (Kritis) --------------------
window.checkLoginStatus = (requiredPage = null) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop();
    
    // Daftar halaman yang membutuhkan login
    const protectedPages = ['profile.html', 'order.html', 'setting.html', 'ask.html'];

    if (protectedPages.includes(currentPage) && !isLoggedIn) {
        alert('Anda harus login untuk mengakses halaman ini.');
        window.location.href = 'login.html';
        return false;
    }

    updateNavMenu();
    return true;
};

window.logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    alert('Anda berhasil logout.');
    window.location.href = 'index.html';
};

// -------------------- Q&A System Global Functions --------------------
// Fungsi untuk merender pertanyaan
window.renderQuestions = () => {
    const questionListContainer = document.getElementById('question-list');
    if (!questionListContainer) return;

    const questions = JSON.parse(localStorage.getItem('questions') || '[]');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const isAdmin = user && user.isAdmin;
    
    questionListContainer.innerHTML = '';

    if (questions.length === 0) {
        questionListContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Belum ada pertanyaan. Jadilah yang pertama!</p>';
        return;
    }

    // Tampilkan pertanyaan terbaru di atas
    questions.reverse().forEach(q => {
        const item = document.createElement('div');
        item.className = 'question-item';
        
        let adminControls = '';
        if (isAdmin) {
            adminControls = `<div class="admin-controls">
                                 <button onclick="replyQuestion(${q.id}, '${q.username}')">Reply</button>
                                 <button onclick="editQuestionContent(${q.id}, '${q.question.replace(/'/g, "\\'")}', '${q.subject.replace(/'/g, "\\'")}')">Edit</button>
                                 <button onclick="deleteQuestion(${q.id})">Hapus</button>
                             </div>`;
        }

        const answerHtml = q.answer 
            ? `<div class="answer-text"><strong>Jawaban Owner (Petter.Exe):</strong><br>${q.answer}</div>`
            : (isAdmin ? `<div class="answer-text" style="color: grey;">Belum dijawab. (Klik Reply)</div>` : '');

        item.innerHTML = `
            <div class="question-header">
                <span>Oleh: ${q.username} pada ${q.date}</span>
                ${adminControls}
            </div>
            <div class="question-text">Subject: ${q.subject}</div>
            <p>${q.question}</p>
            ${answerHtml}
        `;
        questionListContainer.appendChild(item);
    });
};

window.replyQuestion = (id, username) => {
    const answer = prompt(`Tulis balasan Anda untuk ${username}:`);
    if (answer) {
        let questions = JSON.parse(localStorage.getItem('questions'));
        const index = questions.findIndex(q => q.id === id);
        if (index !== -1) {
            questions[index].answer = answer;
            localStorage.setItem('questions', JSON.stringify(questions));
            renderQuestions();
        }
    }
};

window.editQuestionContent = (id, currentQuestion, currentSubject) => {
    const newSubject = prompt('Edit Subject:', currentSubject);
    if (newSubject === null) return;
    const newQuestion = prompt('Edit Pertanyaan:', currentQuestion);
    if (newQuestion === null) return;
    
    let questions = JSON.parse(localStorage.getItem('questions'));
    const index = questions.findIndex(q => q.id === id);
    if (index !== -1) {
        questions[index].subject = newSubject;
        questions[index].question = newQuestion;
        localStorage.setItem('questions', JSON.stringify(questions));
        renderQuestions();
    }
};

window.deleteQuestion = (id) => {
    if (confirm('Yakin ingin menghapus pertanyaan ini?')) {
        let questions = JSON.parse(localStorage.getItem('questions'));
        questions = questions.filter(q => q.id !== id);
        localStorage.setItem('questions', JSON.stringify(questions));
        renderQuestions();
    }
};


// -------------------- FUNGSI UNTUK ORDER.HTML --------------------

// Fungsi untuk mengisi opsi layanan berdasarkan game yang dipilih
function updateServiceOptions() {
    const gameSelect = document.getElementById('game-select');
    const serviceSelect = document.getElementById('service-select');
    const selectedGame = gameSelect.value;
    
    // Kosongkan dan Nonaktifkan
    serviceSelect.innerHTML = '<option value="">-- Pilih Paket Layanan --</option>';
    serviceSelect.disabled = true;
    document.getElementById('display-price').textContent = 'Rp 0';

    if (selectedGame && JOKI_PRICES[selectedGame]) {
        const services = JOKI_PRICES[selectedGame];
        serviceSelect.disabled = false;
        
        services.forEach(service => {
            const option = document.createElement('option');
            // Value akan menyimpan nama layanan dan harga (dipisahkan oleh |)
            option.value = `${service.name}|${service.price}`;
            
            // Teks yang dilihat klien: Nama Layanan [Rp Harga]
            const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(service.price);
            option.textContent = `${service.name} (${formattedPrice})`;
            
            serviceSelect.appendChild(option);
        });
    }
}

// Fungsi untuk menampilkan harga yang dipilih
function updateOrderDetails() {
    const serviceSelect = document.getElementById('service-select');
    const displayPrice = document.getElementById('display-price');
    const selectedValue = serviceSelect.value;
    
    if (selectedValue) {
        // Ambil harga dari value option (nilai setelah |)
        const price = selectedValue.split('|')[1];
        const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
        displayPrice.textContent = formattedPrice;
    } else {
        displayPrice.textContent = 'Rp 0';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // -------------------- 0. Set Tahun Otomatis untuk Footer --------------------
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // -------------------- 9. Inisialisasi Data & Admin --------------------
    if (!localStorage.getItem('users')) {
        // 🚨 Akun Admin: petter.exe, Pw: 552009
        const initialUsers = [{
            username: 'petter.exe',
            email: 'admin@petter.exe',
            password: '552009',
            isAdmin: true,
            profilePic: 'images/petter_profile.jpg'
        }];
        localStorage.setItem('users', JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem('questions')) {
        localStorage.setItem('questions', JSON.stringify([]));
    }
    
    // -------------------- 9. Animasi Loading & Opening --------------------
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    
    if (loadingScreen) {
        setTimeout(() => {
            if (mainContent) mainContent.style.display = 'block';
            if (loadingScreen) loadingScreen.style.animation = 'fadeOut 1s forwards';
        }, 3000); 
    } else {
        updateNavMenu(); 
    }

    // -------------------- 1. Slider Function --------------------
    const sliderContainer = document.querySelector('.slider-container');
    const slider = document.getElementById('main-slider');
    let slideIndex = 0;
    
    if (slider) {
        const slides = document.querySelectorAll('.slide');
        
        if (slides.length > 0) {
            slider.style.width = `${slides.length * 100}%`;
            slides.forEach(slide => {
                slide.style.width = `${100 / slides.length}%`;
            });
        }

        function showSlides() {
            if (slides.length === 0) return;
            slideIndex++;
            if (slideIndex >= slides.length) { slideIndex = 0; }
            slider.style.transform = `translateX(-${slideIndex * (100 / slides.length)}%)`;
        }

        let slideInterval = setInterval(showSlides, 5000); 

        window.moveSlide = (n) => {
            clearInterval(slideInterval);
            slideIndex += n;
            if (slideIndex < 0) { slideIndex = slides.length - 1; }
            if (slideIndex >= slides.length) { slideIndex = 0; }
            slider.style.transform = `translateX(-${slideIndex * (100 / slides.length)}%)`;
            slideInterval = setInterval(showSlides, 5000);
        }
    }
    
    // -------------------- 3. Login & Register Logic --------------------
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameOrEmail = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const users = JSON.parse(localStorage.getItem('users'));
            
            const user = users.find(u => 
                (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password
            );

            if (user) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', JSON.stringify(user));
                alert('Login Berhasil! Selamat datang, ' + user.username);
                window.location.href = 'profile.html';
            } else {
                alert('Username/Email atau Password salah!');
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            let users = JSON.parse(localStorage.getItem('users'));

            if (users.find(u => u.username === username || u.email === email)) {
                alert('Username atau Email sudah terdaftar!');
                return;
            }

            const newUser = {
                username: username,
                email: email,
                password: password,
                isAdmin: false,
                profilePic: 'images/default_avatar.png'
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            alert('Pendaftaran Berhasil! Silakan Login.');
            window.location.href = 'login.html';
        });
    }

    // -------------------- 5. Order Page Logic --------------------
    
    // Handler untuk tombol "Order Sekarang" di index.html
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const game = e.target.dataset.game;
            window.location.href = `order.html?game=${encodeURIComponent(game)}`;
        });
    });

    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        // Event listeners untuk mengupdate layanan dan harga
        document.getElementById('game-select').addEventListener('change', () => {
            updateServiceOptions();
            updateOrderDetails(); 
        });
        document.getElementById('service-select').addEventListener('change', updateOrderDetails);

        // Event Listener untuk QRIS
        const paymentMethodSelect = document.getElementById('payment-method');
        const qrisDisplay = document.getElementById('qris-display');

        const handlePaymentChange = () => {
            if (paymentMethodSelect.value === 'QRIS') {
                qrisDisplay.style.display = 'block';
            } else {
                qrisDisplay.style.display = 'none';
            }
        };

        handlePaymentChange(); 
        paymentMethodSelect.addEventListener('change', handlePaymentChange);
        
        // Otomatisasi data user
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            document.getElementById('contact-email').value = user.email;
        }
        
        // Pilihan game dinamis dari URL
        const urlParams = new URLSearchParams(window.location.search);
        const selectedGame = urlParams.get('game');
        if (selectedGame) {
            document.getElementById('game-select').value = selectedGame;
            updateServiceOptions(); 
        }


        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const game = document.getElementById('game-select').value;
            const selectedServiceValue = document.getElementById('service-select').value;
            
            if (!selectedServiceValue) {
                alert('Mohon pilih paket layanan joki terlebih dahulu.');
                return;
            }
            
            const [serviceName, servicePrice] = selectedServiceValue.split('|');
            
            const robloxUser = document.getElementById('roblox-user').value;
            const robloxPass = document.getElementById('roblox-pass').value;
            const contactNum = document.getElementById('contact-number').value;
            const paymentMethod = document.getElementById('payment-method').value;
            
            const formattedPrice = new Intl.NumberFormat('id-ID').format(servicePrice);

            // Perbarui format pesan WhatsApp
            const orderDetails = `*PESANAN JOKI BARU - TANGGAL: ${new Date().toLocaleDateString('id-ID')}*\n\n` +
                                 `*DETAIL LAYANAN*\n` +
                                 `Game: ${game}\n` +
                                 `Layanan: ${serviceName}\n` +
                                 `Total Harga: Rp ${formattedPrice}\n\n` +
                                 `*DETAIL AKUN ROBlox*\n` +
                                 `Username: ${robloxUser}\n` +
                                 `Password: ${robloxPass}\n\n` +
                                 `*KONTAK & PEMBAYARAN*\n` +
                                 `WA: ${contactNum}\n` +
                                 `Metode Bayar: ${paymentMethod}\n\n` +
                                 `*CATATAN:* Harap segera kirimkan bukti pembayaran untuk melanjutkan proses joki!`;

            const waNumber = '6283899392700'; // Ganti dengan nomor WA Anda
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(orderDetails)}`;

            alert('Pesanan berhasil dibuat! Anda akan diarahkan ke WhatsApp untuk mengirimkan BUKTI PEMBAYARAN dan melanjutkan proses.');
            
            setTimeout(() => {
                 window.open(waUrl, '_blank');
            }, 500);
        });
    }

    // -------------------- 6. Setting Page Logic --------------------
    const settingForm = document.getElementById('setting-form');
    if (settingForm) {
        let user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            document.getElementById('edit-username').value = user.username;
            document.getElementById('edit-email').value = user.email;
            document.getElementById('edit-profile-picture').src = user.profilePic || 'images/default_avatar.png';
        }
        
        document.getElementById('upload-pp').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('edit-profile-picture').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        settingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let users = JSON.parse(localStorage.getItem('users'));
            
            const newUsername = document.getElementById('edit-username').value;
            const newEmail = document.getElementById('edit-email').value;
            const currentPass = document.getElementById('edit-current-pass').value;
            const newPass = document.getElementById('edit-new-pass').value;
            const profilePicSrc = document.getElementById('edit-profile-picture').src;

            if (currentPass !== user.password) {
                alert('Password Saat Ini salah!');
                return;
            }

            const userIndex = users.findIndex(u => u.username === user.username);
            
            if (userIndex !== -1) {
                users[userIndex].username = newUsername;
                users[userIndex].email = newEmail;
                users[userIndex].profilePic = profilePicSrc;
                if (newPass) {
                    users[userIndex].password = newPass;
                }

                user.username = newUsername;
                user.email = newEmail;
                user.profilePic = profilePicSrc;
                if (newPass) {
                    user.password = newPass;
                }

                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(user));

                alert('Pengaturan berhasil disimpan! Mengarahkan ke Profile...');
                window.location.href = 'profile.html';
            }
        });
    }

    // -------------------- 7. Ask Page Logic --------------------
    const askForm = document.getElementById('ask-form');
    if (askForm) {
        askForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const subject = document.getElementById('ask-subject').value;
            const question = document.getElementById('ask-question').value;
            const user = JSON.parse(localStorage.getItem('currentUser'));
            
            if (!user) { return; } 

            let questions = JSON.parse(localStorage.getItem('questions'));
            const newQuestion = {
                id: Date.now(),
                subject: subject,
                question: question,
                username: user.username,
                date: new Date().toLocaleDateString('id-ID'),
                answer: null
            };

            questions.push(newQuestion);
            localStorage.setItem('questions', JSON.stringify(questions));
            
            alert('Pertanyaan berhasil dikirim! Menunggu balasan Owner.');
            askForm.reset();
            renderQuestions(); 
        });
    }
    
    // -------------------- 4. Profile Page Logic --------------------
    const profilePage = document.querySelector('.profile-page');
    if (profilePage) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            document.getElementById('profile-picture').src = user.profilePic || 'images/default_avatar.png';
            document.getElementById('display-username').textContent = user.username;
            document.getElementById('display-email').textContent = user.email;
        }
    }
});
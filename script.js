// ========== AVATAR SYSTEM ==========
// Palet warna premium sesuai WhatsApp style
const AVATAR_COLORS = [
    { bg: '#E9DDF7', text: '#6B4EFF' },  // Ungu/Lavender
    { bg: '#DDEEFF', text: '#3F6FD1' },  // Biru Pastel
    { bg: '#E0F3E8', text: '#2E8B57' },  // Hijau Pastel (WA)
    { bg: '#FFE3D6', text: '#E07A3F' },  // Peach/Orange
    { bg: '#FDDBE7', text: '#D74476' },  // Pink/Rose
    { bg: '#E0F7F6', text: '#1E8E8B' },  // Toska/Cyan
    { bg: '#FCE7F3', text: '#BE185D' },  // Pink 2
    { bg: '#E6F4EA', text: '#188038' },  // Hijau 2
    { bg: '#E3F2FD', text: '#1E88E5' },  // Biru 2
    { bg: '#ECEAF3', text: '#5A4E7C' },  // Abu Premium
];

function getColorPair(name) {
    if (!name) return AVATAR_COLORS[0];
    let total = 0;
    for (let i = 0; i < name.length; i++) {
        total += name.charCodeAt(i) * (i + 1);
    }
    const index = total % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
}

// Darken color dengan HSL (keep saturation/vibrancy)
function getInitial(name) {
    if (!name) return '';
    return name.trim().replace(/[~\s]/g, '').charAt(0).toUpperCase();
}

// ========== GLOBAL STATE ==========
let chatMessages = [];
let lastMessageTime = null;
let currentBattery = Math.floor(Math.random() * (100 - 20 + 1)) + 20;
let currentSignal = Math.floor(Math.random() * 5) + 1; // 1-5 bars
let currentSpeed = Math.floor(Math.random() * (512 - 64 + 1)) + 64; // 64-512 kbps

function generateNextTime() {
    let hour, minute;
    
    if (lastMessageTime === null) {
        // Mulai dari jam real-time saat ini
        const now = new Date();
        hour = now.getHours();
        minute = now.getMinutes();
    } else {
        // Increment 1-3 menit dari pesan sebelumnya
        const [lastHour, lastMinute] = lastMessageTime.split(':').map(Number);
        let totalMinutes = lastHour * 60 + lastMinute;
        const addMinutes = Math.floor(Math.random() * 3) + 1; // 1-3 menit
        totalMinutes += addMinutes;
        
        hour = Math.floor(totalMinutes / 60);
        minute = totalMinutes % 60;
        
        // Jika lebih dari 23:59, reset ke jam sekarang
        if (hour >= 24) {
            const now = new Date();
            hour = now.getHours();
            minute = now.getMinutes();
        }
    }
    
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    lastMessageTime = timeStr;
    
    return timeStr;
}

function updateStatusBar() {
    let displayTime;
    
    // Jika ada chat, jam HP harus sama atau lebih besar dari jam chat terakhir
    if (lastMessageTime) {
        const [lastHour, lastMinute] = lastMessageTime.split(':').map(Number);
        let totalMinutes = lastHour * 60 + lastMinute;
        
        // Tambah 5-30 menit dari chat terakhir untuk jam HP
        const addMinutes = Math.floor(Math.random() * 26) + 5;
        totalMinutes += addMinutes;
        
        let hour = Math.floor(totalMinutes / 60);
        let minute = totalMinutes % 60;
        
        // Jika lebih dari 23:59, reset ke jam sekarang
        if (hour >= 24) {
            const now = new Date();
            hour = now.getHours();
            minute = now.getMinutes();
        }
        
        displayTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } else {
        // Kalau belum ada chat, gunakan jam real-time
        const now = new Date();
        const hour = now.getHours().toString().padStart(2, '0');
        const minute = now.getMinutes().toString().padStart(2, '0');
        displayTime = `${hour}:${minute}`;
    }
    
    // Update jam di status bar semua panel
    const statusTimes = document.querySelectorAll('.status-time');
    statusTimes.forEach(el => {
        el.textContent = displayTime;
    });
    
    // Update battery (random atau tetap)
    if (chatMessages.length === 0) {
        currentBattery = Math.floor(Math.random() * (100 - 20 + 1)) + 20;
    }
    
    const batteryTexts = document.querySelectorAll('.battery-text');
    
    let batteryIcon = 'battery_full';
    if (currentBattery <= 20) {
        batteryIcon = 'battery_alert';
    } else if (currentBattery <= 40) {
        batteryIcon = 'battery_2_bar';
    } else if (currentBattery <= 60) {
        batteryIcon = 'battery_4_bar';
    } else if (currentBattery <= 80) {
        batteryIcon = 'battery_5_bar';
    }
    
    batteryTexts.forEach(el => {
        el.textContent = currentBattery + '%';
    });
    
    document.querySelectorAll('.status-bar').forEach(statusBar => {
        const batteryIconEl = statusBar.querySelector('.status-icons .material-symbols-outlined:last-child');
        if (batteryIconEl) {
            batteryIconEl.textContent = batteryIcon;
        }
    });
    
    // Update signal strength (random setiap generate)
    const signalIcons = document.querySelectorAll('.status-icons .material-symbols-outlined:nth-child(2)');
    let signalIcon = 'signal_cellular_alt';
    if (currentSignal <= 1) {
        signalIcon = 'signal_cellular_1_bar';
    } else if (currentSignal <= 2) {
        signalIcon = 'signal_cellular_2_bar';
    } else if (currentSignal <= 3) {
        signalIcon = 'signal_cellular_3_bar';
    } else if (currentSignal <= 4) {
        signalIcon = 'signal_cellular_4_bar';
    } else {
        signalIcon = 'signal_cellular_alt'; // Full signal
    }
    
    signalIcons.forEach(el => {
        el.textContent = signalIcon;
    });
    
    // Update network speed (random setiap generate) - BEDA TIAP PANEL
    const networkSpeeds = document.querySelectorAll('.network-speed');
    networkSpeeds.forEach((el, index) => {
        // Generate speed berbeda untuk setiap panel
        const speed = Math.floor(Math.random() * (512 - 64 + 1)) + 64; // 64-512 kbps
        el.textContent = `↓ ${speed} kbps`;
    });
}

// Function untuk auto-format nomor HP - SMART: cek dulu, jangan rusak format yang benar
function formatPhoneNumber(input) {
    let value = input.value.trim();
    
    // Jika kosong, jangan apa-apa
    if (!value) return;
    
    // Regex untuk format yang SUDAH BENAR: +62 xxx-xxxx-xxxx
    const correctFormat = /^\+62 \d{3}-\d{4}-\d{4}$/;
    
    // Jika sudah format benar, JANGAN UBAH!
    if (correctFormat.test(value)) {
        return;
    }
    
    // Hapus semua non-digit
    let digits = value.replace(/\D/g, '');
    
    // Jika diawali 0, ganti dengan 62
    if (digits.startsWith('0')) {
        digits = '62' + digits.substring(1);
    }
    
    // Jika belum diawali 62, tambahkan
    if (!digits.startsWith('62')) {
        digits = '62' + digits;
    }
    
    // Format: +62 xxx-xxxx-xxxx
    let formatted = '+62';
    if (digits.length > 2) {
        formatted += ' ' + digits.substring(2, 5); // 3 digit pertama
    }
    if (digits.length > 5) {
        formatted += '-' + digits.substring(5, 9); // 4 digit
    }
    if (digits.length > 9) {
        formatted += '-' + digits.substring(9, 13); // 4 digit terakhir
    }
    
    input.value = formatted;
}

function updateContent() {
    const contactName = document.getElementById('contactName').value;
    const contactStatus = document.getElementById('contactStatus').value;
    const contactBio = document.getElementById('contactBio').value;
    const isSaved = document.getElementById('contactSaved').checked;
    const isPrivacy = document.getElementById('contactPrivacy').checked;
    const showLastSeen = document.getElementById('showLastSeen').checked;
    
    let onlineStatus = 'online';
    if (showLastSeen) {
        const randomOptions = [
            'terakhir dilihat baru saja',
            'terakhir dilihat 2 menit yang lalu',
            'terakhir dilihat 5 menit yang lalu',
            'terakhir dilihat 15 menit yang lalu',
            'terakhir dilihat 1 jam yang lalu',
            'terakhir dilihat hari ini pukul 14:23',
            'terakhir dilihat hari ini pukul 09:15',
            'terakhir dilihat kemarin pukul 22:45',
            'terakhir dilihat kemarin pukul 18:30',
            'terakhir dilihat 20/12/2024'
        ];
        onlineStatus = randomOptions[Math.floor(Math.random() * randomOptions.length)];
    }
    
    const headerNameElement = document.getElementById('displayContactNameTop');
    const headerStatusElement = document.getElementById('displayContactStatusTop');
    
    if (isPrivacy) {
        if (isSaved && contactStatus && contactStatus.trim() !== '') {
            headerNameElement.textContent = contactStatus.replace(/\s+/g, '');
        } else {
            // Tetap tampilkan nomor dengan format asli (dengan spasi)
            headerNameElement.textContent = contactName;
        }
        headerStatusElement.textContent = '';
        headerStatusElement.style.display = 'none';
    } else {
        if (isSaved && contactStatus && contactStatus.trim() !== '') {
            const displayName = contactStatus.replace(/\s+/g, '');
            headerNameElement.textContent = displayName;
        } else {
            // Tetap tampilkan nomor dengan format asli (dengan spasi)
            headerNameElement.textContent = contactName;
        }
        headerStatusElement.textContent = onlineStatus;
        headerStatusElement.style.display = 'block';
    }
    
    const phoneElement = document.getElementById('displayContactPhoneCenter');
    const nameElement = document.getElementById('displayContactNameCenter');
    
    if (isSaved) {
        if (contactStatus && contactStatus.trim() !== '') {
            phoneElement.textContent = contactStatus;
            phoneElement.style.fontWeight = '500';
            phoneElement.style.color = '#000000';
            phoneElement.style.fontSize = '20px';
        } else {
            phoneElement.textContent = 'Nama Kontak';
        }
        
        nameElement.textContent = contactName;
        nameElement.style.display = 'block';
        nameElement.style.fontWeight = 'normal';
        nameElement.style.color = '#667781';
        
    } else {
        phoneElement.textContent = contactName;
        phoneElement.style.fontWeight = '500';
        phoneElement.style.color = '#000000';
        phoneElement.style.fontSize = '20px';
        
        if (contactStatus && contactStatus.trim() !== '') {
            nameElement.textContent = contactStatus;
            nameElement.style.display = 'block';
            nameElement.style.fontWeight = 'normal';
            nameElement.style.color = '#667781';
        } else {
            nameElement.textContent = '';
            nameElement.style.display = 'none';
        }
    }
    
    const bioElement = document.getElementById('displayContactBioCenter');
    if (bioElement) {
        if (contactBio && contactBio.trim() !== '') {
            bioElement.textContent = contactBio;
            bioElement.style.display = 'block';
        } else {
            bioElement.textContent = '';
            bioElement.style.display = 'none';
        }
    }
    
    document.getElementById('displayContactNameScrolled').textContent = contactName;
    
    const actionNames = document.querySelectorAll('.contact-action-name');
    
    actionNames.forEach(elem => {
        const isBlockOrReport = elem.closest('.red-action');
        
        if (isBlockOrReport) {
            if (isSaved && contactStatus && contactStatus.trim() !== '') {
                elem.textContent = contactStatus;
            } else {
                elem.textContent = contactName;
            }
        } else {
            if (contactStatus && contactStatus.trim() !== '') {
                elem.textContent = contactStatus;
            } else {
                elem.textContent = contactName;
            }
        }
    });
    
    // ========== UPDATE AVATAR SYSTEM ==========
    const previewImg = document.getElementById('previewImg');
    const currentPhoto = previewImg ? previewImg.src : '';
    updateAllAvatars(currentPhoto);
}

function addMessage() {
    const messageText = document.getElementById('newMessageText').value.trim();
    const messageSender = document.getElementById('messageSender').value;
    const messageStatus = document.getElementById('messageStatus').value;
    
    if (messageText === '') {
        alert('Pesan tidak boleh kosong!');
        return;
    }
    
    // Auto-detect resi dari format 【resi】 atau 【resi1,resi2】
    const resiMatch = messageText.match(/【([A-Z0-9,\s]+)】/);
    if (resiMatch) {
        const detectedResi = resiMatch[1].replace(/\s+/g, ''); // Hapus spasi
        document.getElementById('resiNumber').value = detectedResi;
        console.log('Resi terdeteksi:', detectedResi);
    }
    
    const messageTime = generateNextTime();
    
    // Push pesan yang diketik
    chatMessages.push({
        text: messageText,
        sender: messageSender,
        status: messageStatus,
        time: messageTime
    });
    
    // JIKA OUTGOING dan checkbox auto-reply aktif, langsung generate INCOMING
    const autoReplyEnabled = document.getElementById('autoReplyCancel') ? 
                            document.getElementById('autoReplyCancel').checked : false;
    
    if (messageSender === 'outgoing' && autoReplyEnabled) {
        const autoReply = generateAutoReplyCancel();
        const replyTime = generateNextTime(); // Jam berikutnya
        
        chatMessages.push({
            text: autoReply,
            sender: 'incoming',
            status: 'read',
            time: replyTime
        });
    }
    
    currentBattery = Math.max(5, currentBattery - Math.floor(Math.random() * 3) - 1);
    
    document.getElementById('newMessageText').value = '';
    
    renderChat();
    renderChatHistory();
    updateStatusBar();
}

function renderChat() {
    const chatBody = document.querySelector('#chat-view .chat-body');
    
    const bubbles = chatBody.querySelectorAll('.message-bubble');
    bubbles.forEach(bubble => bubble.remove());
    
    chatMessages.forEach(msg => {
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${msg.sender === 'incoming' ? 'incoming' : 'outgoing'}`;
        
        let checkmarkHTML = '';
        if (msg.sender === 'outgoing') {
            if (msg.status === 'sent') {
                checkmarkHTML = '<span class="material-symbols-outlined checkmark" style="color: #8696a0;">done</span>';
            } else if (msg.status === 'delivered') {
                checkmarkHTML = '<span class="double-check"><span class="material-symbols-outlined checkmark" style="color: #8696a0;">done_all</span></span>';
            } else if (msg.status === 'read') {
                checkmarkHTML = '<span class="double-check"><span class="material-symbols-outlined checkmark" style="color: #53bdeb;">done_all</span></span>';
            }
        }
        
        // Set text langsung tanpa modifikasi
        const textNode = document.createElement('div');
        textNode.textContent = msg.text;
        let safeText = textNode.innerHTML;
        
        bubble.innerHTML = safeText + `<span class="time">${msg.time} ${checkmarkHTML}</span>`;
        
        chatBody.appendChild(bubble);
    });
    
    chatBody.scrollTop = chatBody.scrollHeight;
}

function renderChatHistory() {
    const historyDiv = document.getElementById('chatHistoryEditor');
    
    if (chatMessages.length === 0) {
        historyDiv.innerHTML = '<p style="color: #999; text-align: center; padding: 10px;">Belum ada pesan</p>';
        return;
    }
    
    historyDiv.innerHTML = '';
    
    chatMessages.forEach((msg, index) => {
        const entry = document.createElement('div');
        entry.className = `chat-entry ${msg.sender}`;
        entry.innerHTML = `
            <span>${msg.sender === 'incoming' ? '📥' : '📤'} ${msg.text.substring(0, 30)}${msg.text.length > 30 ? '...' : ''}</span>
            <button onclick="deleteMessage(${index})">Hapus</button>
        `;
        historyDiv.appendChild(entry);
    });
}

function resetForm() {
    // Reset input fields
    document.getElementById('contactName').value = '';
    document.getElementById('contactStatus').value = '';
    document.getElementById('contactBio').value = '';
    document.getElementById('resiNumber').value = '';
    
    // Reset checkboxes
    document.getElementById('contactSaved').checked = false;
    document.getElementById('contactPrivacy').checked = true;
    document.getElementById('showLastSeen').checked = false;
    
    // Reset chat messages
    chatMessages = [];
    lastMessageTime = null;
    
    // Update display - PANEL MOCKUP JUGA IKUT RESET!
    updateContent();
    renderChat(); // ← TAMBAHAN INI! Reset panel mockup
    renderChatHistory();
}

function deleteMessage(index) {
    chatMessages.splice(index, 1);
    renderChat();
    renderChatHistory();
}

function clearChat() {
    if (confirm('Hapus semua pesan dinamis?')) {
        chatMessages = [];
        lastMessageTime = null;
        currentBattery = Math.floor(Math.random() * (100 - 20 + 1)) + 20;
        renderChat();
        renderChatHistory();
        updateStatusBar();
    }
}

async function exportCollage() {
    try {
        // ========== VALIDASI WAJIB ==========
        const contactName = document.getElementById('contactName').value.trim();
        const resiNumber = document.getElementById('resiNumber').value.trim();
        
        // 1. Cek nomor HP wajib diisi
        if (!contactName) {
            alert('❌ Nomor HP wajib diisi!\n\nSilakan isi nomor HP di kolom "Nomor HP (Wajib)"');
            return;
        }
        
        // 2. Cek nomor resi wajib diisi
        if (!resiNumber) {
            alert('❌ Nomor Resi wajib diisi!\n\nSilakan isi nomor resi di kolom "Nomor Resi"');
            return;
        }
        
        // 3. Cek apakah nomor HP di form sama dengan yang ada di chat
        // Ambil nomor HP dari chat header (yang tampil di mockup)
        const chatHeaderNumber = document.querySelector('#chat-view .contact-name')?.textContent || '';
        
        if (chatHeaderNumber && contactName !== chatHeaderNumber) {
            alert(`❌ Nomor HP tidak cocok!\n\nNomor HP di form: ${contactName}\nNomor HP di chat: ${chatHeaderNumber}\n\nHarap pastikan nomor HP sama dengan yang ada di chat!`);
            return;
        }
        
        // Tampilkan loading
        const exportBtn = event.target;
        const originalText = exportBtn.textContent;
        exportBtn.textContent = '⏳ Generating...';
        exportBtn.disabled = true;
        
        // Ambil nomor resi
        const fileName = `${resiNumber}.png`;
        
        // Ambil container yang berisi 3 panel
        const collageContainer = document.querySelector('.collage-container');
        
        // Render menggunakan html2canvas
        const canvas = await html2canvas(collageContainer, {
            backgroundColor: '#f0f2f5',
            scale: 2, // Untuk kualitas lebih tinggi
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: collageContainer.scrollWidth,  // Capture full width including overflow
            windowWidth: collageContainer.scrollWidth,
            x: 0,
            y: 0
        });
        
        // Convert canvas ke blob
        canvas.toBlob(function(blob) {
            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = fileName;
            link.href = url;
            link.click();
            
            // Cleanup
            URL.revokeObjectURL(url);
            
            // Reset form setelah export
            resetForm();
            
            // Reset button
            exportBtn.textContent = originalText;
            exportBtn.disabled = false;
        }, 'image/png');
        
    } catch (error) {
        console.error('Error exporting collage:', error);
        alert('Gagal export PNG. Silakan coba lagi.');
        event.target.textContent = '📥 Export PNG (3 Panel)';
        event.target.disabled = false;
    }
}

function toggleResiEdit() {
    const resiInput = document.getElementById('resiNumber');
    const btnEdit = document.getElementById('btnEditResi');
    
    if (resiInput.readOnly) {
        // Enable editing
        resiInput.readOnly = false;
        resiInput.style.backgroundColor = 'white';
        resiInput.focus();
        btnEdit.textContent = '✅ Simpan';
        btnEdit.style.backgroundColor = '#25d366';
    } else {
        // Disable editing (save)
        resiInput.readOnly = true;
        resiInput.style.backgroundColor = '#f0f0f0';
        btnEdit.textContent = '✏️ Edit';
        btnEdit.style.backgroundColor = '#128C7E';
    }
}

function handleProfilePicture() {
    const input = document.getElementById('profilePicture');
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            
            // Update preview
            const previewImg = document.getElementById('previewImg');
            const previewIcon = document.querySelector('#previewAvatar .material-symbols-outlined');
            previewImg.src = imageData;
            previewImg.style.display = 'block';
            if (previewIcon) previewIcon.style.display = 'none';
            
            // Update semua avatar di 3 panel
            updateAllAvatars(imageData);
        };
        reader.readAsDataURL(file);
    }
}

function updateAllAvatars(imageData) {
    const contactName = document.getElementById('contactName').value;
    const contactStatus = document.getElementById('contactStatus').value;
    
    // Get color pair (bg + text) berdasarkan nama
    const colorPair = getColorPair(contactStatus || contactName);
    const bgColor = colorPair.bg;
    const textColor = colorPair.text;
    
    ['#avatar-chat', '#avatar-profile', '#avatar-scrolled'].forEach(id => {
        const container = document.querySelector(id);
        if (!container) return;
        
        const hasPhoto = imageData && imageData.trim() !== '' && !imageData.includes('HT77KvxN');
        
        // Tentukan font size berdasarkan container
        let fontSize = '18px'; // Diperkecil dari 22px
        let iconSize = '22px'; // Diperkecil dari 24px
        if (id === '#avatar-profile') {
            fontSize = '48px'; // Diperkecil dari 55px
            iconSize = '58px'; // Diperkecil dari 64px
        }
        
        // RESET TOTAL: Hapus semua child
        container.innerHTML = '';
        container.style.position = 'relative';
        
        if (hasPhoto) {
            // CASE 1: Ada foto
            const img = document.createElement('img');
            img.className = 'avatar-img';
            img.src = imageData;
            img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;';
            container.appendChild(img);
            container.style.background = 'transparent';
        }
        else if (contactStatus && contactStatus.trim() !== '') {
            // CASE 2: Ada nama (tampilkan huruf)
            const text = document.createElement('div');
            text.textContent = getInitial(contactStatus);
            text.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                font-size: ${fontSize};
                font-weight: 500;
                color: ${textColor};
                text-transform: uppercase;
            `;
            container.appendChild(text);
            container.style.background = bgColor;
        }
        else {
            // CASE 3: Tidak ada foto & nama (tampilkan icon custom SVG)
            const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            iconSvg.setAttribute('viewBox', '0 0 24 24');
            iconSvg.setAttribute('fill', textColor);
            iconSvg.style.cssText = `
                width: ${iconSize};
                height: ${iconSize};
                display: block;
            `;
            
            // Path SVG person dengan rounded bottom (mirip WA)
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4z');
            iconSvg.appendChild(path);
            
            const iconWrapper = document.createElement('div');
            iconWrapper.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
            `;
            iconWrapper.appendChild(iconSvg);
            
            container.appendChild(iconWrapper);
            container.style.background = bgColor;
        }
    });
}

function resetProfilePicture() {
    const defaultAvatar = 'https://i.ibb.co.com/HT77KvxN/image.png';
    
    // Reset input file
    document.getElementById('profilePicture').value = '';
    
    // Reset preview ke default
    const previewImg = document.getElementById('previewImg');
    const previewIcon = document.querySelector('#previewAvatar .material-symbols-outlined');
    previewImg.src = defaultAvatar;
    previewImg.style.display = 'block';
    if (previewIcon) previewIcon.style.display = 'none';
    
    // Reset semua avatar ke default foto baru
    // Panel 1 - Chat
    const avatarChat = document.querySelector('#avatar-chat .avatar-img');
    const iconChat = document.querySelector('#avatar-chat .avatar-icon');
    if (avatarChat && iconChat) {
        avatarChat.src = defaultAvatar;
        avatarChat.style.display = 'block';
        iconChat.style.display = 'none';
    }
    
    // Panel 2 - Profile
    const avatarProfile = document.querySelector('#avatar-profile .avatar-img');
    const iconProfile = document.querySelector('#avatar-profile .avatar-icon');
    if (avatarProfile && iconProfile) {
        avatarProfile.src = defaultAvatar;
        avatarProfile.style.display = 'block';
        iconProfile.style.display = 'none';
    }
    
    // Panel 3 - Profile Scrolled
    const avatarScrolled = document.querySelector('#avatar-scrolled .avatar-img');
    const iconScrolled = document.querySelector('#avatar-scrolled .avatar-icon');
    if (avatarScrolled && iconScrolled) {
        avatarScrolled.src = defaultAvatar;
        avatarScrolled.style.display = 'block';
        iconScrolled.style.display = 'none';
    }
}

let bulkData = [];

function generateRandomTime() {
    // Generate jam random antara 08:00 - 20:00
    const hour = Math.floor(Math.random() * (20 - 8 + 1)) + 8; // 8-20
    const minute = Math.floor(Math.random() * 60); // 0-59
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function generateRandomBattery() {
    // Generate battery random antara 15% - 95%
    return Math.floor(Math.random() * (95 - 15 + 1)) + 15;
}

function generateAutoReplyCancel() {
    // Generate balasan random dengan kata BATAL, CANCEL, atau RETUR
    const keywords = ['batal', 'cancel', 'retur'];
    const selectedKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    let replies = [];
    
    if (selectedKeyword === 'batal') {
        replies = [
            'Batalin aja bg paket nya',
            'Tolong dibatalin kak',
            'Cancel aja lah bg, batalin',
            'Bg batalin aja paket nya ya',
            'Kak tolong dibatalkan paket nya',
            'Batalin aja kak ga jadi',
            'Ga jadi kak, batalin aja'
        ];
    } else if (selectedKeyword === 'cancel') {
        replies = [
            'Cancel aja kak',
            'Cancel aja bg ga jadi',
            'Tolong di-cancel kak',
            'Bg cancel aja paket nya',
            'Cancel kak ga jadi ambil',
            'Cancel aja lah bg',
            'Ga jadi kak, cancel aja'
        ];
    } else { // retur
        replies = [
            'Retur aja lah',
            'Tolong diretur kak',
            'Bg retur aja paket nya',
            'Retur aja kak ga sesuai',
            'Kak tolong diretur',
            'Retur aja lah bg',
            'Ga sesuai kak, retur aja'
        ];
    }
    
    return replies[Math.floor(Math.random() * replies.length)];
}

function toggleControlPanel() {
    const panel = document.querySelector('.control-panel');
    panel.classList.toggle('open');
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.target.closest('.tab-btn').classList.add('active');
}

function handleBulkExcel() {
    const file = document.getElementById('bulkExcelFile').files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            if (jsonData.length === 0) {
                alert('File Excel kosong atau format tidak sesuai!');
                return;
            }
            
            bulkData = jsonData;
            
            // Show preview
            document.getElementById('bulkRowCount').textContent = bulkData.length;
            
            let previewHTML = '<table style="width: 100%; border-collapse: collapse; font-size: 11px;">';
            previewHTML += '<tr style="background: #f0f0f0; font-weight: 600;"><td style="padding: 4px; border: 1px solid #ddd;">No</td><td style="padding: 4px; border: 1px solid #ddd;">Nama</td><td style="padding: 4px; border: 1px solid #ddd;">Nomor</td><td style="padding: 4px; border: 1px solid #ddd;">Resi</td><td style="padding: 4px; border: 1px solid #ddd;">Foto</td><td style="padding: 4px; border: 1px solid #ddd;">Pesan/Balasan</td></tr>';
            
            bulkData.slice(0, 5).forEach((row, idx) => {
                const msgCount = (row.Pesan ? '✓' : '') + (row.Balasan ? '✓' : '');
                const fotoIcon = row.Foto ? '🖼️' : '-';
                previewHTML += `<tr><td style="padding: 4px; border: 1px solid #ddd;">${idx + 1}</td><td style="padding: 4px; border: 1px solid #ddd;">${row.Nama || '-'}</td><td style="padding: 4px; border: 1px solid #ddd;">${row.Nomor || '-'}</td><td style="padding: 4px; border: 1px solid #ddd;">${row.Resi || '-'}</td><td style="padding: 4px; border: 1px solid #ddd;">${fotoIcon}</td><td style="padding: 4px; border: 1px solid #ddd;">${msgCount || '-'}</td></tr>`;
            });
            
            if (bulkData.length > 5) {
                previewHTML += `<tr><td colspan="6" style="padding: 4px; text-align: center; color: #999;">... dan ${bulkData.length - 5} baris lainnya</td></tr>`;
            }
            
            previewHTML += '</table>';
            
            document.getElementById('bulkDataPreview').innerHTML = previewHTML;
            document.getElementById('bulkPreview').style.display = 'block';
            document.getElementById('btnBulkGenerate').style.display = 'block';
            document.getElementById('btnBulkGenerate').disabled = false;
            
        } catch (error) {
            console.error('Error reading Excel:', error);
            alert('Gagal membaca file Excel. Pastikan format file benar!');
        }
    };
    reader.readAsArrayBuffer(file);
}

async function startBulkGenerate() {
    if (bulkData.length === 0) {
        alert('Tidak ada data untuk diproses!');
        return;
    }
    
    // Disable button
    const btn = document.getElementById('btnBulkGenerate');
    btn.disabled = true;
    btn.textContent = '⏳ Processing...';
    
    // Show progress
    document.getElementById('bulkProgress').style.display = 'block';
    
    const zip = new JSZip();
    const total = bulkData.length;
    
    for (let i = 0; i < total; i++) {
        const row = bulkData[i];
        
        // Update progress
        document.getElementById('progressText').textContent = `${i + 1}/${total}`;
        document.getElementById('progressBar').style.width = `${((i + 1) / total) * 100}%`;
        
        try {
            // ========== VALIDASI WAJIB ==========
            // 1. Cek nomor HP wajib diisi
            if (!row.Nomor || row.Nomor.trim() === '') {
                alert(`❌ Baris ${i + 1}: Nomor HP wajib diisi!\n\nSkip baris ini.`);
                continue; // Skip baris ini
            }
            
            // 2. Cek nomor resi wajib diisi
            if (!row.Resi || row.Resi.trim() === '') {
                alert(`❌ Baris ${i + 1}: Nomor Resi wajib diisi!\n\nSkip baris ini.`);
                continue; // Skip baris ini
            }
            
            // Set data ke form
            document.getElementById('contactName').value = row.Nomor || '';
            document.getElementById('contactStatus').value = row.Nama || ''; // Opsional, bisa kosong
            document.getElementById('contactBio').value = row.Bio || ''; // Opsional, bisa kosong
            document.getElementById('resiNumber').value = row.Resi || '';
            
            // Set foto profil dari URL jika ada
            if (row.Foto && row.Foto.trim() !== '') {
                const fotoURL = row.Foto.trim();
                // Set preview image
                document.getElementById('previewImg').src = fotoURL;
                // Update semua avatar di mockup
                updateAllAvatars(fotoURL);
            } else {
                // Jika tidak ada foto, gunakan default
                const defaultAvatar = 'https://i.ibb.co.com/HT77KvxN/image.png';
                document.getElementById('previewImg').src = defaultAvatar;
                updateAllAvatars(defaultAvatar);
            }
            
            // Set checkbox saved jika ada nama
            const isSaved = row.Nama && row.Nama.trim() !== '';
            document.getElementById('contactSaved').checked = isSaved;
            
            // Reset lastMessageTime untuk setiap baris baru
            lastMessageTime = null;
            
            // Generate batre random setiap generate (20-100%)
            currentBattery = Math.floor(Math.random() * (100 - 20 + 1)) + 20;
            
            // Generate signal random setiap generate (1-5 bars)
            currentSignal = Math.floor(Math.random() * 5) + 1;
            
            // Generate speed random setiap generate (64-512 kbps)
            currentSpeed = Math.floor(Math.random() * (512 - 64 + 1)) + 64;
            
            // GENERATE JAM RANDOM untuk gambar ini (BEDA setiap gambar!)
            const randomHour = Math.floor(Math.random() * (20 - 8 + 1)) + 8; // 8-20
            const randomMinute = Math.floor(Math.random() * 60); // 0-59
            const baseTime = `${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}`;
            
            // Clear and add messages dengan JAM YANG LOGIS dan RANDOM
            chatMessages = [];
            
            // Cek checkbox auto-reply
            const autoReplyEnabled = document.getElementById('autoReplyCancel') ? 
                                    document.getElementById('autoReplyCancel').checked : true;
            
            // Add outgoing message first (Balasan - dari kita)
            if (row.Balasan) {
                chatMessages.push({
                    text: row.Balasan,
                    sender: 'outgoing',
                    status: 'read',
                    time: baseTime
                });
                lastMessageTime = baseTime;
                
                // AUTO-GENERATE INCOMING dengan kata BATAL/CANCEL/RETUR jika:
                // 1. Checkbox auto-reply dicentang
                // 2. Kolom Pesan kosong
                if (autoReplyEnabled && (!row.Pesan || row.Pesan.trim() === '')) {
                    row.Pesan = generateAutoReplyCancel(); // Generate balasan random
                }
            }
            
            // Add incoming message second (Pesan - dari kontak) - JAM HARUS LEBIH BESAR!
            if (row.Pesan) {
                // Tambah 1-5 menit dari baseTime
                const [hour, minute] = baseTime.split(':').map(Number);
                let totalMinutes = hour * 60 + minute;
                totalMinutes += Math.floor(Math.random() * 5) + 1; // +1 sampai 5 menit
                
                const newHour = Math.floor(totalMinutes / 60);
                const newMinute = totalMinutes % 60;
                const time2 = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
                
                chatMessages.push({
                    text: row.Pesan,
                    sender: 'incoming',
                    status: 'read',
                    time: time2
                });
                lastMessageTime = time2;
            }
            
            renderChat();
            
            // Update content
            updateContent();
            
            // Update status bar dengan jam dan batre baru
            updateStatusBar();
            
            // Wait a bit for render
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Generate image
            const collageContainer = document.querySelector('.collage-container');
            const canvas = await html2canvas(collageContainer, {
                backgroundColor: '#f0f2f5',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                width: collageContainer.scrollWidth,  // Capture full width including overflow
                windowWidth: collageContainer.scrollWidth,
                x: 0,
                y: 0
            });
            
            // Convert to blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            
            // Add to ZIP with resi as filename
            const fileName = (row.Resi || `image_${i + 1}`) + '.png';
            zip.file(fileName, blob);
            
        } catch (error) {
            console.error(`Error generating image ${i + 1}:`, error);
        }
    }
    
    // Generate ZIP and download
    try {
        const zipBlob = await zip.generateAsync({type: 'blob'});
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.download = `bulk-wa-export-${Date.now()}.zip`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        alert(`✅ Selesai! ${total} gambar telah di-export dalam file ZIP.`);
    } catch (error) {
        console.error('Error creating ZIP:', error);
        alert('Gagal membuat file ZIP!');
    }
    
    // Reset
    btn.disabled = false;
    btn.textContent = '🚀 Generate Semua & Export ZIP';
    document.getElementById('bulkProgress').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    updateContent();
    renderChatHistory();
    updateStatusBar();
    
    // ========== PASTE IMAGE UNTUK FOTO PROFIL ==========
    // Event listener untuk paste gambar dari clipboard
    const profileSection = document.getElementById('profilePictureSection');
    const avatarPreview = document.getElementById('avatarPreview');
    
    // Paste listener di whole document (lebih universal)
    document.addEventListener('paste', function(e) {
        // Cek apakah ada clipboard items
        const items = e.clipboardData?.items;
        if (!items) return;
        
        // Loop semua items di clipboard
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            // Cek apakah item adalah image
            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();
                
                const blob = item.getAsFile();
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    const imageData = event.target.result;
                    
                    // Update preview image
                    document.getElementById('previewImg').src = imageData;
                    
                    // Update semua avatar di mockup
                    updateAllAvatars(imageData);
                    
                    // Show success message
                    console.log('✅ Image pasted successfully!');
                };
                
                reader.readAsDataURL(blob);
                break;
            }
        }
    });
    
    // Highlight area saat fokus (opsional)
    avatarPreview.addEventListener('focus', function() {
        this.style.border = '2px dashed #128C7E';
    });
    
    avatarPreview.addEventListener('blur', function() {
        this.style.border = 'none';
    });
});
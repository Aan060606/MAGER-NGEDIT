// ========== PWA FEATURES: Push Notifications & Service Worker ==========

// ========== 1. REGISTER SERVICE WORKER ==========
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/MAGER-NGEDIT/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration.scope);
        
        // Check for updates setiap 1 jam
        setInterval(() => {
          registration.update();
        }, 3600000);
        
        // Detect update available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 New Service Worker found');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Ada update baru!
              showUpdateNotification();
            }
          });
        });
      })
      .catch(error => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}

// ========== 2. SHOW UPDATE NOTIFICATION ==========
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #128C7E;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-size: 14px;
    display: flex;
    gap: 15px;
    align-items: center;
  `;
  
  notification.innerHTML = `
    <span>📦 Update tersedia!</span>
    <button onclick="updateApp()" style="
      background: white;
      color: #128C7E;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    ">Perbarui</button>
  `;
  
  document.body.appendChild(notification);
}

// Update app dengan reload
window.updateApp = function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    });
  }
  window.location.reload();
};

// ========== 3. PUSH NOTIFICATIONS ==========
let notificationPermission = 'default';

// Request notification permission
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('❌ Browser tidak support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    notificationPermission = 'granted';
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    notificationPermission = permission;
    return permission === 'granted';
  }
  
  return false;
}

// Show local notification (tanpa server)
function showLocalNotification(title, options = {}) {
  if (notificationPermission !== 'granted') {
    console.log('⚠️ Notification permission not granted');
    return;
  }
  
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body: options.body || 'Notifikasi dari Pod Express',
        icon: options.icon || '/MAGER-NGEDIT/icon-192x192.png',
        badge: '/MAGER-NGEDIT/icon-192x192.png',
        vibrate: [200, 100, 200],
        tag: options.tag || 'pod-express-notification',
        requireInteraction: false,
        actions: [
          { action: 'open', title: 'Buka', icon: '/MAGER-NGEDIT/icon-192x192.png' },
          { action: 'close', title: 'Tutup', icon: '/MAGER-NGEDIT/icon-192x192.png' }
        ],
        data: options.data || {}
      });
    });
  } else {
    // Fallback ke browser notification
    new Notification(title, {
      body: options.body || 'Notifikasi dari Pod Express',
      icon: options.icon || '/MAGER-NGEDIT/icon-192x192.png',
      badge: '/MAGER-NGEDIT/icon-192x192.png'
    });
  }
}

// ========== 4. OFFLINE/ONLINE DETECTION ==========
let wasOffline = false;

window.addEventListener('online', () => {
  console.log('✅ Back online');
  
  if (wasOffline) {
    showLocalNotification('Koneksi Kembali', {
      body: 'Anda kembali online! Semua fitur tersedia.',
      tag: 'online-status'
    });
    wasOffline = false;
  }
  
  // Update UI
  const offlineBadge = document.getElementById('offlineBadge');
  if (offlineBadge) offlineBadge.style.display = 'none';
});

window.addEventListener('offline', () => {
  console.log('❌ Gone offline');
  wasOffline = true;
  
  showLocalNotification('Koneksi Terputus', {
    body: 'Anda sedang offline. Beberapa fitur mungkin tidak tersedia.',
    tag: 'offline-status'
  });
  
  // Show offline badge
  let offlineBadge = document.getElementById('offlineBadge');
  if (!offlineBadge) {
    offlineBadge = document.createElement('div');
    offlineBadge.id = 'offlineBadge';
    offlineBadge.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #ff9800;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    offlineBadge.textContent = '📡 Offline Mode';
    document.body.appendChild(offlineBadge);
  }
  offlineBadge.style.display = 'block';
});

// ========== 5. INSTALL PROMPT ==========
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('💾 Install prompt available');
  e.preventDefault();
  deferredPrompt = e;
  
  // Show custom install button
  showInstallButton();
});

function showInstallButton() {
  const installBtn = document.createElement('button');
  installBtn.id = 'installBtn';
  installBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #128C7E;
    color: white;
    border: none;
    padding: 15px 25px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9998;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  `;
  
  installBtn.innerHTML = '📱 Install App';
  
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      deferredPrompt = null;
      installBtn.remove();
    }
  });
  
  // Don't show if already installed
  if (!window.matchMedia('(display-mode: standalone)').matches) {
    document.body.appendChild(installBtn);
  }
}

// Detect if app is installed
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installed successfully');
  showLocalNotification('Pod Express Terinstall', {
    body: 'Aplikasi berhasil diinstall! Buka dari home screen.',
    tag: 'app-installed'
  });
  
  const installBtn = document.getElementById('installBtn');
  if (installBtn) installBtn.remove();
});

// ========== 6. AUTO-REQUEST NOTIFICATION ON FIRST VISIT ==========
window.addEventListener('DOMContentLoaded', () => {
  // Request notification setelah 3 detik (user experience lebih baik)
  setTimeout(() => {
    const hasAskedBefore = localStorage.getItem('notificationAsked');
    
    if (!hasAskedBefore && Notification.permission === 'default') {
      requestNotificationPermission().then(granted => {
        localStorage.setItem('notificationAsked', 'true');
        
        if (granted) {
          showLocalNotification('Notifikasi Aktif! 🎉', {
            body: 'Anda akan menerima notifikasi dari Pod Express.',
            tag: 'welcome-notification'
          });
        }
      });
    }
  }, 3000);
});

// ========== 7. SHARE TARGET (jika ada file di-share ke app) ==========
if ('serviceWorker' in navigator && 'share' in navigator) {
  // Check if opened via share
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('share')) {
    console.log('📤 Opened from share');
    // Handle shared content here
  }
}

// ========== 8. BACKGROUND SYNC (Optional - untuk upload offline) ==========
async function registerBackgroundSync(tag) {
  if ('serviceWorker' in navigator && 'sync' in registration) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log('✅ Background sync registered:', tag);
    } catch (error) {
      console.log('❌ Background sync failed:', error);
    }
  }
}

// ========== 9. SHORTCUTS HANDLER ==========
// Detect which shortcut was clicked
const urlParams = new URLSearchParams(window.location.search);
const action = urlParams.get('action');

if (action === 'generate') {
  console.log('🎯 Opened from "Generate Chat" shortcut');
  // Auto-switch to generate tab
  setTimeout(() => {
    const generateTab = document.querySelector('[onclick*="switchTab(\'basic\')"]');
    if (generateTab) generateTab.click();
  }, 500);
}

if (action === 'bulk') {
  console.log('📊 Opened from "Bulk Excel" shortcut');
  // Auto-switch to bulk tab
  setTimeout(() => {
    const bulkTab = document.querySelector('[onclick*="switchTab(\'bulk\')"]');
    if (bulkTab) bulkTab.click();
  }, 500);
}

// ========== 10. EXPORT FUNCTIONS ==========
window.pwaFeatures = {
  requestNotificationPermission,
  showLocalNotification,
  registerBackgroundSync,
  updateApp
};

console.log('✅ PWA Features loaded');

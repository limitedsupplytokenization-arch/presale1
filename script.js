// 48 saatlik GLOBAL geri sayım - herkes için aynı
// Başlangıç: 26 Eylül 2025, 01:00 UTC (sabit zaman)
const PRESALE_START_TIME = new Date('2025-09-26T01:00:00Z').getTime();
const PRESALE_DURATION = 48 * 60 * 60 * 1000; // 48 saat (milisaniye)
const countdownEndDate = PRESALE_START_TIME + PRESALE_DURATION;

function updateCountdown() {
    const now = new Date().getTime();
    const distance = countdownEndDate - now;

    if (distance < 0) {
        document.getElementById('countdown').innerHTML = "Sale Ended";
        return;
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Presale sabitleri
const LST_PRICE_ETH = 0.000125; // 1 LST = 0.000125 ETH (base price - no discount)
const MIN_LST_AMOUNT = 10; // Minimum 10 LST
const PRESALE_ADDRESS = '0xE2e7183C1b6d53812ecCB5f1D3B48757D5d03cF4'; // BASE ağı
let connectedAccount = null;
let currentDiscountRate = 0; // 0, 0.25, 0.5, 0.625

// Genesis NFT sahipleri (indirim listeleri)
const DISCOUNT_50_LIST = new Set([
    '0xf886f144141a535126d63943aeeaef77759da71a',
    '0x11217bf4da72c7b4425a83b4736699eec7444ec3',
    '0xbad2c23dc0db47aa4dc0f7d668c7e11da9013a57',
    '0xe59b8e526f8bfae05504ada2721069387cf45b77',
    '0xf5d347b41e414f8e23f911305f28b1f1dd4855c5',
    '0x5109bb177d097983c0764459445e2f890ea5f2ef',
    '0x1a89f4063ae41ccc882b5947a629fb6bdd078ea1',
    '0x2b1e78c4304d4962f80263e0ba299cf9ac5c41dc',
    '0x6a7415b36133c6c3957e4772b8009068e170c648',
    '0x5ffc6980fc0d00325805ce8954d342a77ff9cf42',
    '0x6ce6e24c7469aae61548c15c235389ac8f1ea10a',
]);

const DISCOUNT_25_LIST = new Set([
    '0x0fb44e60791f11c43dcbafc8ecf03502adeacb50',
    '0xbf44162160de5a72d16264592b182e2fe30cf07a',
    '0xb6a0a5093b94e3382773b80c420ad5a18b64a390',
    '0xf2c5e22f21b07214e691a4c78b38fc6cfc9113f6',
    '0x0fb44e60791f11c43dcbafc8ecf03502adeacb50', // duplicate ok
    '0x599ab2f4e3cc0bef0e2c27c726f71b403b0a9328',
    '0xc2ec7ed3305cb57dbb22cac8754c7ff54500743c',
    '0xdeb0213cdb4c28787bc718256987c98503d28df6',
    '0x057291bd078f28687009ec4f17672adf6fe88423',
    '0x0bcb05ebeeeba9cf8d568f1c9e9413e7bc631dc3',
    '0xd60999f2a9c581ddabab4a1a7272d131e93968ca',
    '0xbc3502effa6815d7f9e7cd4e2f0232ea77690bef',
    '0x766b3a974a296990e5d7fde6ebd88befa69754d5',
    '0xd3a0cca0906777f7d9d2f88c87db9fa7868147fe',
    '0x383549bf8ed3b9b5d64b11751f346e078cbb9f3d',
    '0xE8d5f38f98cc39259063b53669335F5Da128D466',
]);

const DISCOUNT_62_5_LIST = new Set([
    '0x77027545f635a4d988fffbce1a4d7a57ab661af5',
    '0x60626bcc4b6f5392d87f425c32b84fa7442215ed',
    '0x9aaefef1c92b615e7c5da93d5c7166767dac27ab',
    '0x91628188530f7b93919c81eb4d5dfe9d93ecb5be',
    '0x6C93Eb73573910853ea8b2AB3B78BB73952BCF49',
]);

// 12 bin cüzdan adresi için %10 indirim listesi
// JSON dosyasından yüklenecek
const DISCOUNT_10_LIST = new Set();

// JSON dosyasından cüzdan adreslerini yükleme fonksiyonu
async function loadWalletAddresses() {
    try {
        console.log('🔄 wallets.json dosyası yükleniyor...');
        const response = await fetch('wallets.json');
        if (!response.ok) {
            throw new Error(`wallets.json dosyası bulunamadı. HTTP Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📄 JSON dosyası yüklendi:', data);
        
        // Cüzdan adreslerini Set'e ekle
        if (data.discount_wallets && Array.isArray(data.discount_wallets)) {
            data.discount_wallets.forEach(addr => {
                DISCOUNT_10_LIST.add(addr.toLowerCase());
            });
            
            console.log(`✅ ${data.discount_wallets.length} cüzdan adresi yüklendi (%10 indirim)`);
            console.log(`📊 Toplam indirim oranı: %${(data.discount_rate * 100)}`);
            return data.discount_wallets.length;
        } else {
            throw new Error('JSON dosyasında discount_wallets array bulunamadı');
        }
        
    } catch (error) {
        console.error('❌ Cüzdan adresleri yüklenirken hata:', error);
        console.log('💡 wallets.json dosyasını oluşturup cüzdan adreslerini ekleyin');
        return 0;
    }
}

// Normalize lists to lowercase to avoid checksum/case mismatches
(function normalizeDiscountLists() {
    function lowerize(setRef) {
        const values = Array.from(setRef);
        setRef.clear();
        values.forEach(v => setRef.add(String(v).toLowerCase()));
    }
    lowerize(DISCOUNT_50_LIST);
    lowerize(DISCOUNT_25_LIST);
    lowerize(DISCOUNT_62_5_LIST);
    lowerize(DISCOUNT_10_LIST);
})();

function determineDiscountRateForAddress(address) {
    if (!address) return 0;
    const addr = address.toLowerCase();
    if (DISCOUNT_62_5_LIST.has(addr)) return 0.625; // 62.5% off
    if (DISCOUNT_50_LIST.has(addr)) return 0.5; // 50% off
    if (DISCOUNT_25_LIST.has(addr)) return 0.25; // 25% off
    if (DISCOUNT_10_LIST.has(addr)) return 0.1; // 10% off
    return 0;
}

function getEffectivePriceEth() {
    // effective = base * (1 - discount)
    const price = LST_PRICE_ETH * (1 - currentDiscountRate);
    // Ondalık basamak sayısını sınırla (maksimum 6 basamak)
    return parseFloat(price.toFixed(6));
}

function renderDiscountNotice() {
    // Remove existing if any
    const existing = document.querySelector('.discount-notice');
    if (existing) existing.remove();

    if (currentDiscountRate <= 0) {
        // also reset base price label
        const priceLabel = document.querySelector('#presaleForm .price-info small');
        if (priceLabel) {
            priceLabel.textContent = `1 LST = ${LST_PRICE_ETH} ETH`;
        }
        return;
    }

    const discountPercent = Math.round(currentDiscountRate * 1000) / 10; // 62.5 etc
    const effectivePrice = getEffectivePriceEth();

    // Update price label under the input
    const priceLabel = document.querySelector('#presaleForm .price-info small');
    if (priceLabel) {
        priceLabel.textContent = `1 LST = ${effectivePrice} ETH (discounted)`;
    }

    // Create a small notice above the form
    const notice = document.createElement('div');
    notice.className = 'discount-notice';
    notice.style.margin = '8px 0 12px 0';
    notice.style.padding = '10px 12px';
    notice.style.borderRadius = '16px';
    notice.style.background = 'rgba(40, 167, 69, 0.12)';
    notice.style.border = '1px solid rgba(40, 167, 69, 0.35)';
    notice.style.color = '#1e7e34';
    notice.style.fontSize = '13px';
    notice.style.display = 'flex';
    notice.style.alignItems = 'center';
    notice.style.gap = '8px';
    // Farklı indirim oranları için farklı mesajlar
    let discountMessage;
    if (currentDiscountRate === 0.1) {
        discountMessage = `You can get a 10% discount for joining Testnet V1!`;
    } else {
        discountMessage = `You are eligible for a ${discountPercent}% discount for holding a Genesis NFT!`;
    }
    
    notice.innerHTML = `<i class="fas fa-badge-check" style="color:#28a745;"></i><span>${discountMessage}</span>`;

    const presaleForm = document.getElementById('presaleForm');
    if (presaleForm) {
        presaleForm.parentNode.insertBefore(notice, presaleForm);
    }
}

// Create a short memo for the transaction data field to reflect purchase intent.
// This is purely informational and does not transfer tokens. Keep it ASCII and short.
function buildPurchaseIntentMemo({ lstAmount, effectivePriceEth, discountRate }) {
    try {
        const discountPct = Math.round(discountRate * 1000) / 10; // e.g., 62.5
        const memo = `LST-PURCHASE|amount=${lstAmount}|price=${effectivePriceEth}|discount=${discountPct}%`;
        // Convert ASCII string to hex with 0x prefix
        let hex = '0x';
        for (let i = 0; i < memo.length; i++) {
            const code = memo.charCodeAt(i).toString(16);
            hex += code.length === 1 ? '0' + code : code;
        }
        return hex;
    } catch (e) {
        // Fallback to empty data if encoding fails
        return '0x';
    }
}

// Cüzdan bağlama fonksiyonu - YEREL DOSYA UYUMLU
async function connectWallet() {
    console.log('🔍 MetaMask bağlantısı başlatılıyor...');
    console.log('Sayfa URL:', window.location.href);
    console.log('Protocol:', window.location.protocol);
    
    // Yerel dosya kontrolü
    if (window.location.protocol === 'file:') {
        alert('⚠️ Local File Warning!\n\nMetaMask does not work with local files (file://).\n\nSolutions:\n1. Use Live Server (VS Code)\n2. Use XAMPP/WAMP\n3. Deploy to GitHub Pages\n4. Use Netlify/Vercel');
        return;
    }

    // MetaMask kontrolü
    if (!window.ethereum) {
        alert('MetaMask not found! Please install the MetaMask extension.');
        window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn', '_blank');
        return;
    }

    // Eğer zaten bağlı bir hesap varsa, kullanıcıyı uyar
    if (connectedAccount) {
        const switchAccount = confirm('You are already connected to a wallet. Do you want to switch to a different account?');
        if (!switchAccount) {
            return;
        }
    }

    try {
        console.log('✅ MetaMask bulundu, hesap istekleri başlatılıyor...');
        
        // MetaMask popup'ını aç
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        if (!accounts || accounts.length === 0) {
            throw new Error('Hesap bulunamadı');
        }
        
        connectedAccount = accounts[0];
        console.log('✅ Cüzdan başarıyla bağlandı:', connectedAccount);
        
        // İndirim oranını belirle
        currentDiscountRate = determineDiscountRateForAddress(connectedAccount);
        renderDiscountNotice();
        updateETHAmount();
        
        // Ağ kontrolü - BASE ağına geçiş
        await switchToBaseNetwork();
        
        // UI güncellemeleri - kart boyunu değiştirmeden içerik değiştir
        document.getElementById('connectBtn').style.display = 'none';
        document.getElementById('presaleForm').style.display = 'block';

        // Phase 1 kartının boyunu sabit tut ve üst içerikleri gizle
        const presaleInterface = document.querySelector('.presale-interface');
        
        if (presaleInterface) {
            presaleInterface.style.height = 'auto';
            presaleInterface.style.minHeight = '400px';
            // CSS class ekleyerek gizle
            presaleInterface.classList.add('wallet-connected');
        }
        
        // Tüm gizlenecek elementleri bul ve gizle
        const elementsToHide = [
            '.interface-header',
            '.countdown-section', 
            '.progress-section'
        ];
        
        elementsToHide.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'none';
                console.log(`${selector} gizlendi`);
            } else {
                console.log(`${selector} bulunamadı`);
            }
        });
        
        // Bağlanan cüzdan bilgisini göster
        showConnectedWallet(connectedAccount);
        
        // Başarı mesajı
        showSuccessMessage('Wallet connected successfully!');
        
    } catch (error) {
        console.error('❌ Cüzdan bağlanırken hata:', error);
        
        let errorMessage = 'An error occurred while connecting wallet.';
        
        if (error.code === 4001) {
            errorMessage = 'Wallet connection was rejected by user.';
        } else if (error.code === -32002) {
            errorMessage = 'A connection request is already pending. Please check MetaMask.';
        } else if (error.message.includes('User rejected')) {
            errorMessage = 'Wallet connection was rejected.';
        }
        
        showErrorMessage(errorMessage);
    }
}

// Başarı mesajı göster
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Hata mesajı göster
function showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Bağlanan cüzdan bilgisini göster
function showConnectedWallet(address) {
    const shortAddress = address.slice(0, 6) + '...' + address.slice(-4);
    
    // Cüzdan bilgisi için bir div oluştur
    const walletInfo = document.createElement('div');
    walletInfo.className = 'wallet-info';
    walletInfo.innerHTML = `
        <div class="wallet-status">
            <i class="fas fa-check-circle"></i>
            <span>Connected: ${shortAddress}</span>
            <div class="wallet-actions">
                <button onclick="disconnectWallet()" class="disconnect-btn">Logout</button>
                <button onclick="switchWallet()" class="switch-btn">Switch Wallet</button>
            </div>
        </div>
    `;
    
    // Presale formundan önce ekle
    const presaleForm = document.getElementById('presaleForm');
    presaleForm.parentNode.insertBefore(walletInfo, presaleForm);
}

// Cüzdan bağlantısını kes
function disconnectWallet() {
    connectedAccount = null;
    currentDiscountRate = 0;
    
    // Wallet info'yu kaldır
    const walletInfo = document.querySelector('.wallet-info');
    if (walletInfo) {
        walletInfo.remove();
    }
    
    // Connect butonunu göster, presale formunu gizle
    document.getElementById('connectBtn').style.display = 'block';
    document.getElementById('presaleForm').style.display = 'none';
    renderDiscountNotice();
    
    // Formu temizle
    document.getElementById('lstAmount').value = '';
    document.getElementById('ethAmount').textContent = '0.000000 ETH';
    document.getElementById('buyBtn').disabled = true;
    
    // Orijinal UI'yi geri yükle
    const interfaceHeader = document.querySelector('.interface-header');
    const countdownSection = document.querySelector('.countdown-section');
    const progressSection = document.querySelector('.progress-section');
    const presaleInterface = document.querySelector('.presale-interface');
    
    if (interfaceHeader) interfaceHeader.style.display = 'block';
    if (countdownSection) countdownSection.style.display = 'block';
    if (progressSection) progressSection.style.display = 'block';
    if (presaleInterface) presaleInterface.classList.remove('wallet-connected');
    
    // MetaMask'tan tamamen çıkış yap
    if (window.ethereum) {
        // MetaMask'tan çıkış yapmak için kullanıcıyı yönlendir
        try {
            // MetaMask'ın disconnect metodunu dene (eğer varsa)
            if (window.ethereum.disconnect) {
                window.ethereum.disconnect();
            }
            // Alternatif: MetaMask'ı sıfırla
            if (window.ethereum._metamask) {
                window.ethereum._metamask.isUnlocked = false;
            }
        } catch (error) {
            console.log('MetaMask disconnect not available:', error);
        }
    }
    
    showSuccessMessage('Wallet disconnected successfully! Please refresh the page to completely disconnect from MetaMask.');
}

// Cüzdan değiştir
function switchWallet() {
    if (window.ethereum) {
        // MetaMask'ta hesap değiştirme isteği
        try {
            window.ethereum.request({
                method: 'wallet_requestPermissions',
                params: [{ eth_accounts: {} }]
            }).then(() => {
                // Hesap değişti, sayfayı yenile
                window.location.reload();
            }).catch((error) => {
                console.log('Hesap değiştirme iptal edildi:', error);
            });
        } catch (error) {
            console.log('Hesap değiştirme hatası:', error);
            // Alternatif: Kullanıcıyı MetaMask'a yönlendir
            alert('Please switch accounts in MetaMask and refresh the page.');
        }
    }
}

// Cüzdan durumunu güncelle
function updateWalletStatus(address) {
    const button = document.querySelector('.connect-wallet-btn');
    const shortAddress = address.slice(0, 6) + '...' + address.slice(-4);
    
    button.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${shortAddress}
    `;
    button.style.background = '#4CAF50';
    button.onclick = disconnectWallet;
}

// Duplicate disconnect function removed - using the main one above

// Navigasyon menü etkileşimi
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Aktif sınıfı kaldır
            navItems.forEach(nav => nav.classList.remove('active'));
            // Tıklanan öğeye aktif sınıfı ekle
            this.classList.add('active');
        });
    });
});

// İlerleme çubuğu animasyonu
function animateProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    const targetWidth = 0; // Hedef yüzde - başlangıçta 0%
    
    let currentWidth = 0;
    const increment = targetWidth / 100;
    
    const interval = setInterval(() => {
        currentWidth += increment;
        progressFill.style.width = currentWidth + '%';
        
        if (currentWidth >= targetWidth) {
            clearInterval(interval);
        }
    }, 20);
}

// MetaMask kontrolü ve bekleme
function waitForMetaMask() {
    return new Promise((resolve) => {
        if (window.ethereum) {
            resolve(window.ethereum);
            return;
        }
        
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            if (window.ethereum) {
                clearInterval(checkInterval);
                resolve(window.ethereum);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                resolve(null);
            }
        }, 500);
    });
}

// Sayfa yüklendiğinde çalışacak fonksiyonlar
window.addEventListener('load', async function() {
    // Geri sayımı başlat
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Ensure no JS prevents mobile scroll; do not attach touchmove listeners here
    
    // İlerleme çubuğu animasyonunu başlat
    setTimeout(animateProgressBar, 1000);
    
    // JSON dosyasından cüzdan adreslerini yükle (%10 indirim listesi)
    await loadWalletAddresses();
    
    // MetaMask kontrolü - bekle
    const ethereum = await waitForMetaMask();
    if (ethereum) {
        console.log('✅ MetaMask yüklü ve hazır!');
        console.log('MetaMask provider:', ethereum);
        setupMetaMaskListeners();
    } else {
        console.log('❌ MetaMask bulunamadı');
    }
    
    // LST input event listener
    const lstInput = document.getElementById('lstAmount');
    if (lstInput) {
        lstInput.addEventListener('input', updateETHAmount);
    }
});

// MetaMask dinleyicilerini kur
function setupMetaMaskListeners() {
    if (window.ethereum) {
        // Hesap değişikliği dinleyicisi
        window.ethereum.on('accountsChanged', function(accounts) {
            if (accounts.length === 0) {
                // Kullanıcı cüzdanı kapatmış
                disconnectWallet();
            } else if (connectedAccount && accounts[0] !== connectedAccount) {
                // Farklı hesaba geçmiş
                connectedAccount = accounts[0];
                currentDiscountRate = determineDiscountRateForAddress(connectedAccount);
                renderDiscountNotice();
                updateETHAmount();
                const walletInfo = document.querySelector('.wallet-info');
                if (walletInfo) {
                    const shortAddress = accounts[0].slice(0, 6) + '...' + accounts[0].slice(-4);
                    walletInfo.querySelector('span').textContent = `Connected: ${shortAddress}`;
                }
            }
        });
        
        // Ağ değişikliği dinleyicisi
        window.ethereum.on('chainChanged', function(chainId) {
            console.log('Ağ değişti:', chainId);
            if (connectedAccount) {
                // BASE ağı kontrolü
                if (chainId !== '0x2105') {
                    alert('Lütfen BASE ağına geçin!');
                }
            }
        });
        
        console.log('✅ MetaMask dinleyicileri kuruldu');
    }
}

// Sosyal medya linklerini aç
document.addEventListener('DOMContentLoaded', function() {
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.querySelector('i').className;
            
            // Platforma göre URL'leri ayarla
            let url = '#';
            if (platform.includes('telegram')) {
                url = 'https://t.me/LSTcoins';
            } else if (platform.includes('twitter')) {
                url = 'https://x.com/LSTcoins';
            } else if (platform.includes('discord')) {
                url = '#';
            } else if (platform.includes('book')) {
                url = 'https://docs.lstcoins.org';
            }
            
            window.open(url, '_blank');
        });
    });
});

// LST miktarı değiştiğinde ETH hesaplama
function updateETHAmount() {
    const lstInput = document.getElementById('lstAmount');
    const ethAmount = document.getElementById('ethAmount');
    const buyBtn = document.getElementById('buyBtn');
    
    if (lstInput && ethAmount && buyBtn) {
        const lstAmount = parseFloat(lstInput.value) || 0;
        const ethCost = lstAmount * getEffectivePriceEth();
        
        // ETH miktarını güncelle
        ethAmount.textContent = ethCost.toFixed(6) + ' ETH';
        
        // Min ve max alım kontrolü
        if (lstAmount >= MIN_LST_AMOUNT && lstAmount <= 9800) {
            buyBtn.disabled = false;
            buyBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        } else {
            buyBtn.disabled = true;
            buyBtn.style.background = '#6c757d';
        }
    }
}

// LST satın alma fonksiyonu - GERÇEK İŞLEM
async function buyLST() {
    if (!connectedAccount) {
        showErrorMessage('Please connect your wallet first!');
        return;
    }
    
    const lstAmount = parseFloat(document.getElementById('lstAmount').value);
    const ethAmount = lstAmount * getEffectivePriceEth();
    
    // Proceed directly to MetaMask without on-page confirmation
    
    if (lstAmount < MIN_LST_AMOUNT) {
        showErrorMessage(`Minimum ${MIN_LST_AMOUNT} LST required!`);
        return;
    }
    
    if (lstAmount > 9800) {
        showErrorMessage(`Maximum 9800 LST allowed!`);
        return;
    }
    
    // Direkt MetaMask'a geç, onay isteme
    
    try {
        // BASE ağına geçiş kontrolü
        await switchToBaseNetwork();
        
        // ETH bakiyesi kontrolü
        const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [connectedAccount, 'latest']
        });
        
        const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
        if (balanceInEth < ethAmount) {
            showErrorMessage(`Insufficient balance! Required: ${ethAmount.toFixed(6)} ETH, Available: ${balanceInEth.toFixed(6)} ETH`);
            return;
        }
        
        // Gas estimation - MetaMask otomatik hesaplasın
        let gasEstimate;
        try {
            gasEstimate = await window.ethereum.request({
                method: 'eth_estimateGas',
                params: [{
                    to: PRESALE_ADDRESS,
                    from: connectedAccount,
                    value: '0x' + (ethAmount * Math.pow(10, 18)).toString(16)
                }]
            });
            console.log('📊 Estimated gas:', gasEstimate);
        } catch (error) {
            console.log('⚠️ Gas estimation failed, using default:', error);
            gasEstimate = '0x5208'; // 21000 gas (default for simple transfer)
        }
        
        // ETH gönderimi - GERÇEK İŞLEM (MetaMask otomatik gas price kullanacak)
        const transactionParameters = {
            to: PRESALE_ADDRESS,
            from: connectedAccount,
            value: '0x' + (ethAmount * Math.pow(10, 18)).toString(16), // Wei'ye çevir
            gas: gasEstimate, // Otomatik hesaplanan gas
            // gasPrice kaldırıldı - MetaMask otomatik ayarlayacak
        };
        
        console.log('🚀 İşlem gönderiliyor...', transactionParameters);
        
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });
        
        console.log('✅ Transaction successful! Hash:', txHash);
        showSuccessMessage(`Transaction successful! Hash: ${txHash.slice(0, 10)}...`);
        
        // İşlem hash'ini göster
        const txInfo = document.createElement('div');
        txInfo.className = 'transaction-info';
        txInfo.innerHTML = `
            <div class="tx-success">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>Transaction Successful!</strong>
                    <p>Hash: <a href="https://basescan.org/tx/${txHash}" target="_blank">${txHash.slice(0, 10)}...${txHash.slice(-8)}</a></p>
                </div>
            </div>
        `;
        
        const presaleForm = document.getElementById('presaleForm');
        presaleForm.appendChild(txInfo);
        
    } catch (error) {
        console.error('❌ İşlem hatası:', error);
        
        let errorMessage = 'Transaction failed!';
        
        if (error.code === 4001) {
            errorMessage = 'Transaction was rejected by user.';
        } else if (error.code === -32603) {
            errorMessage = 'Transaction failed. Insufficient balance possible.';
        } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient balance!';
        } else if (error.message.includes('gas')) {
            errorMessage = 'Gas error. Please try again.';
        }
        
        showErrorMessage(errorMessage);
    }
}

// BASE ağına geçiş
async function switchToBaseNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }], // BASE chain ID
        });
        console.log('✅ Switched to BASE network');
    } catch (switchError) {
        console.log('BASE network not found, adding...');
        // BASE ağı yoksa ekle
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x2105',
                        chainName: 'Base',
                        nativeCurrency: {
                            name: 'Ethereum',
                            symbol: 'ETH',
                            decimals: 18,
                        },
                        rpcUrls: ['https://mainnet.base.org'],
                        blockExplorerUrls: ['https://basescan.org'],
                    }],
                });
                console.log('✅ BASE network added');
            } catch (addError) {
                console.error('❌ Failed to add BASE network:', addError);
                throw addError;
            }
    } else {
            throw switchError;
        }
    }
}

// Send Assets butonu fonksiyonu
function showSendAssets() {
    const modal = document.getElementById('sendAssetsModal');
    if (!modal) {
        alert('Send Assets modal not found.');
        return;
    }
    // Lock background scroll only on desktop; keep mobile scroll free
    const isDesktop = window.innerWidth > 768;
    if (isDesktop) {
        const previousOverflow = document.body.style.overflow;
        modal.dataset.prevOverflow = previousOverflow || '';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    } else {
        modal.dataset.prevOverflow = '';
    }
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeSendAssets() {
    const modal = document.getElementById('sendAssetsModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => { 
        modal.style.display = 'none'; 
        // Restore background scroll (if it was changed)
        if (modal.dataset.prevOverflow !== undefined) {
            document.body.style.overflow = modal.dataset.prevOverflow || '';
            document.documentElement.style.overflow = modal.dataset.prevOverflow || '';
        }
    }, 300);
}

function copyAddress(text, btn) {
    try {
        navigator.clipboard.writeText(text).then(() => {
            if (btn) {
                const original = btn.textContent;
                btn.textContent = 'Copied';
                setTimeout(() => { btn.textContent = original; }, 1200);
            }
        });
    } catch (e) {
        alert('Copy failed');
    }
}

// Contract adresi kopyalama
function copyContractAddress(fullAddress, btn) {
    try {
        navigator.clipboard.writeText(fullAddress).then(() => {
            const originalIcon = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.style.background = '#4CAF50';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.innerHTML = originalIcon;
                btn.style.background = '#f0f0f0';
                btn.style.color = '#333';
            }, 1500);
        });
    } catch (e) {
        alert('Copy failed');
    }
}
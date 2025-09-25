// Geri sayım zamanlayıcısı
const countdownEndDate = new Date('2025-09-15T11:00:00').getTime();

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
const LST_PRICE_ETH = 0.000125; // 1 LST = 0.000125 ETH
const MIN_LST_AMOUNT = 10; // Minimum 10 LST
const PRESALE_ADDRESS = '0xE2e7183C1b6d53812ecCB5f1D3B48757D5d03cF4'; // BASE ağı
let connectedAccount = null;

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
        
        // Ağ kontrolü - BASE ağına geçiş
        await switchToBaseNetwork();
        
        // UI güncellemeleri - kart boyunu değiştirmeden içerik değiştir
        document.getElementById('connectBtn').style.display = 'none';
        document.getElementById('presaleForm').style.display = 'block';
        
        // Phase 1 kartının boyunu sabit tut
        const presaleInterface = document.querySelector('.presale-interface');
        if (presaleInterface) {
            presaleInterface.style.height = 'auto';
            presaleInterface.style.minHeight = '400px'; // Minimum yükseklik sabit
        }
        
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
            <span>Bağlandı: ${shortAddress}</span>
            <button onclick="disconnectWallet()" class="disconnect-btn">Çıkış</button>
        </div>
    `;
    
    // Presale formundan önce ekle
    const presaleForm = document.getElementById('presaleForm');
    presaleForm.parentNode.insertBefore(walletInfo, presaleForm);
}

// Cüzdan bağlantısını kes
function disconnectWallet() {
    connectedAccount = null;
    
    // Wallet info'yu kaldır
    const walletInfo = document.querySelector('.wallet-info');
    if (walletInfo) {
        walletInfo.remove();
    }
    
    // Connect butonunu göster, presale formunu gizle
    document.getElementById('connectBtn').style.display = 'block';
    document.getElementById('presaleForm').style.display = 'none';
    
    // Formu temizle
    document.getElementById('lstAmount').value = '';
    document.getElementById('ethAmount').textContent = '0.000000 ETH';
    document.getElementById('buyBtn').disabled = true;
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

// Cüzdan bağlantısını kes
function disconnectWallet() {
    const button = document.querySelector('.connect-wallet-btn');
    button.innerHTML = `
        <i class="fas fa-wallet"></i>
        Connect Wallet
    `;
    button.style.background = '#4a90e2';
    button.onclick = connectWallet;
}

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
    const targetWidth = 59.25; // Hedef yüzde
    
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
    
    // İlerleme çubuğu animasyonunu başlat
    setTimeout(animateProgressBar, 1000);
    
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
                const walletInfo = document.querySelector('.wallet-info');
                if (walletInfo) {
                    const shortAddress = accounts[0].slice(0, 6) + '...' + accounts[0].slice(-4);
                    walletInfo.querySelector('span').textContent = `Bağlandı: ${shortAddress}`;
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
        const ethCost = lstAmount * LST_PRICE_ETH;
        
        // ETH miktarını güncelle
        ethAmount.textContent = ethCost.toFixed(6) + ' ETH';
        
        // Min alım kontrolü
        if (lstAmount >= MIN_LST_AMOUNT) {
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
    const ethAmount = lstAmount * LST_PRICE_ETH;
    
    if (lstAmount < MIN_LST_AMOUNT) {
        showErrorMessage(`Minimum ${MIN_LST_AMOUNT} LST required!`);
        return;
    }
    
    // Onay iste
    const confirmPurchase = confirm(
        `LST Purchase Confirmation\n\n` +
        `Amount: ${lstAmount} LST\n` +
        `Payment: ${ethAmount.toFixed(6)} ETH\n` +
        `Recipient: ${PRESALE_ADDRESS}\n\n` +
        `Do you want to continue?`
    );
    
    if (!confirmPurchase) {
        return;
    }
    
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
        
        // ETH gönderimi - GERÇEK İŞLEM
        const transactionParameters = {
            to: PRESALE_ADDRESS,
            from: connectedAccount,
            value: '0x' + (ethAmount * Math.pow(10, 18)).toString(16), // Wei'ye çevir
            gas: '0x5208', // 21000 gas
            gasPrice: '0x' + (20 * Math.pow(10, 9)).toString(16), // 20 Gwei
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
    alert('Send Assets feature coming soon!\n\nQR codes and wallet addresses will be displayed here.');
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
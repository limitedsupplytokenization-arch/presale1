// Token price in USD (you can change this value)
const TOKEN_PRICE_USD = 0.19; // $0.19 per LST token

// Simple wallet connection variables
let currentAccount = null;
let isConnected = false;

// Set countdown end date (48 hours from now, but paused for now)
// To start the countdown, uncomment the line below and comment out the paused line
// const countdownEndDate = new Date(Date.now() + (48 * 60 * 60 * 1000)).getTime();
const countdownEndDate = new Date('2024-12-31T23:59:59').getTime(); // Paused countdown

// DOM elements
const tokenAmountInput = document.getElementById('tokenAmount');
const paymentAmountSpan = document.getElementById('paymentAmount');
const hoursSpan = document.getElementById('hours');
const minutesSpan = document.getElementById('minutes');
const secondsSpan = document.getElementById('seconds');

// Token calculator function
function calculatePayment() {
    let tokenAmount = parseFloat(tokenAmountInput.value) || 0;
    
    // Check maximum limit
    if (tokenAmount > 10000) {
        tokenAmount = 10000;
        tokenAmountInput.value = 10000;
    }
    
    const paymentAmount = tokenAmount * TOKEN_PRICE_USD;
    paymentAmountSpan.textContent = `$${paymentAmount.toFixed(2)}`;
}

// Countdown timer function
function updateCountdown() {
    const now = new Date().getTime();
    const distance = countdownEndDate - now;

    if (distance < 0) {
        // Countdown has ended
        hoursSpan.textContent = '00';
        minutesSpan.textContent = '00';
        secondsSpan.textContent = '00';
        return;
    }

    // Calculate time units
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update display
    hoursSpan.textContent = hours.toString().padStart(2, '0');
    minutesSpan.textContent = minutes.toString().padStart(2, '0');
    secondsSpan.textContent = seconds.toString().padStart(2, '0');
}

// Button functions
function showHowItWorks() {
    alert('How it works:\n\n1. Enter the amount of LST tokens you want to buy\n2. See the total cost in USD\n3. Click "Buy $LST" to proceed with the purchase\n4. Connect your wallet and complete the transaction\n\nThis is a demo version. In the real implementation, this would show a detailed modal or redirect to a help page.');
}

// Wallet Modal Functions
function showWalletModal() {
    const tokenAmount = parseFloat(tokenAmountInput.value) || 0;
    
    if (tokenAmount < 1) {
        alert('Minimum purchase amount is 1 LST token.');
        return;
    }
    
    if (tokenAmount > 10000) {
        alert('Maximum purchase amount is 10,000 LST tokens.');
        return;
    }
    
    document.getElementById('walletModal').style.display = 'block';
}

function closeWalletModal() {
    document.getElementById('walletModal').style.display = 'none';
    document.getElementById('walletStatus').style.display = 'none';
}

async function connectMetaMask() {
    const statusDiv = document.getElementById('walletStatus');
    const statusMessage = document.getElementById('statusMessage');
    
    statusDiv.style.display = 'block';
    statusDiv.style.background = 'rgba(255, 255, 255, 0.1)';
    statusMessage.textContent = 'Connecting to MetaMask...';
    
    try {
        console.log('Starting MetaMask connection...');
        
        // Check if MetaMask is available
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed. Please install MetaMask extension.');
        }
        
        if (!window.ethereum.isMetaMask) {
            throw new Error('MetaMask is not installed. Please install MetaMask extension.');
        }
        
        console.log('MetaMask detected, requesting accounts...');
        
        // Request accounts
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        console.log('Accounts received:', accounts);
        
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found. Please unlock MetaMask.');
        }
        
        // Success!
        currentAccount = accounts[0];
        isConnected = true;
        
        console.log('Successfully connected to:', currentAccount);
        
        // Get network info
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkName = getNetworkName(parseInt(chainId, 16));
        
        console.log('Connected to network:', networkName, 'ID:', chainId);
        
        // Update status
        statusDiv.style.background = 'rgba(76, 175, 80, 0.2)';
        statusMessage.textContent = `Connected! Address: ${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}\nNetwork: ${networkName}`;
        
        // Show purchase button
        const purchaseButton = document.getElementById('purchaseButton');
        purchaseButton.style.display = 'block';
        
        // Show purchase summary
        const tokenAmount = parseFloat(tokenAmountInput.value) || 0;
        const paymentAmount = tokenAmount * TOKEN_PRICE_USD;
        
        setTimeout(() => {
            statusMessage.textContent = `Connected! Purchase Summary:\n\nTokens: ${tokenAmount} $LST\nTotal Cost: $${paymentAmount.toFixed(2)}\nAddress: ${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}\nNetwork: ${networkName}`;
        }, 1000);
        
    } catch (error) {
        console.error('MetaMask connection error:', error);
        statusDiv.style.background = 'rgba(244, 67, 54, 0.2)';
        statusMessage.textContent = `Connection failed: ${error.message}`;
    }
}

function getNetworkName(networkId) {
    switch (networkId) {
        case 1: return 'Ethereum Mainnet';
        case 3: return 'Ropsten Testnet';
        case 4: return 'Rinkeby Testnet';
        case 5: return 'Goerli Testnet';
        case 42: return 'Kovan Testnet';
        case 56: return 'BSC Mainnet';
        case 97: return 'BSC Testnet';
        case 137: return 'Polygon Mainnet';
        case 80001: return 'Polygon Mumbai Testnet';
        default: return `Network ID: ${networkId}`;
    }
}

// Real on-chain purchase function
async function purchaseLST() {
    if (!isConnected || !currentAccount) {
        alert('Please connect your wallet first.');
        return;
    }
    
    const tokenAmount = parseFloat(tokenAmountInput.value) || 0;
    if (tokenAmount < 1) {
        alert('Minimum purchase amount is 1 LST token.');
        return;
    }
    
    if (tokenAmount > 10000) {
        alert('Maximum purchase amount is 10,000 LST tokens.');
        return;
    }
    
    const paymentAmount = tokenAmount * TOKEN_PRICE_USD;
    const paymentAmountWei = '0x' + (paymentAmount * 1e18).toString(16); // Convert to Wei hex
    
    try {
        // Create transaction object
        const transactionParameters = {
            to: '0x0000000000000000000000000000000000000000', // Replace with actual contract address
            from: currentAccount,
            value: paymentAmountWei
        };
        
        // Send transaction
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters]
        });
        
        console.log('Transaction sent:', txHash);
        alert(`Purchase successful! Transaction hash: ${txHash}`);
        
    } catch (error) {
        console.error('Transaction failed:', error);
        alert(`Transaction failed: ${error.message}`);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('walletModal');
    if (event.target === modal) {
        closeWalletModal();
    }
}

// Event listeners
tokenAmountInput.addEventListener('input', calculatePayment);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set initial calculation
    calculatePayment();
    
    // Start countdown timer
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Add some interactive effects
    tokenAmountInput.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    tokenAmountInput.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
    
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', function (accounts) {
            if (accounts.length === 0) {
                // User disconnected
                currentAccount = null;
                isConnected = false;
                console.log('User disconnected from MetaMask');
            } else {
                // User switched accounts
                currentAccount = accounts[0];
                console.log('Account changed to:', currentAccount);
            }
        });
        
        // Listen for chain changes
        window.ethereum.on('chainChanged', function (chainId) {
            console.log('Network changed to:', chainId);
            // Reload the page when network changes
            window.location.reload();
        });
    } else {
        console.log('MetaMask is not installed');
    }
});

// Add some visual feedback for the countdown
function addCountdownEffects() {
    const countdownElement = document.getElementById('countdown');
    
    // Add a subtle glow effect when time is running low
    const now = new Date().getTime();
    const distance = countdownEndDate - now;
    const hoursLeft = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (hoursLeft <= 48) {
        countdownElement.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.2)';
    } else if (hoursLeft <= 72) {
        countdownElement.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.1)';
    }
}

// Call effects function periodically
setInterval(addCountdownEffects, 5000);

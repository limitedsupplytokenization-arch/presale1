

// Token price in ETH (you can change this value)
const TOKEN_PRICE_ETH = 0.000045; // 0.000045 ETH per LST token

// LST Token Contract Details
const LST_TOKEN_ADDRESS = '0x1D41F2046E119A9Ad132Fc909045a02DE6E7e502';
const BASE_CHAIN_ID = '0x2105'; // Base Mainnet
const BASE_CHAIN_ID_DECIMAL = 8453;





// Simple wallet connection variables


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
    
    const paymentAmount = tokenAmount * TOKEN_PRICE_ETH;
    paymentAmountSpan.textContent = `${paymentAmount.toFixed(6)} ETH`;
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
        case 8453: return 'Base Mainnet';
        case 84531: return 'Base Goerli Testnet';
        default: return `Network ID: ${networkId}`;
    }
}

// Simple purchase function (demo)
function purchaseLST() {
    const tokenAmount = parseFloat(tokenAmountInput.value) || 0;
    
    if (tokenAmount < 1) {
        alert('Minimum purchase amount is 1 LST token.');
        return;
    }
    
    if (tokenAmount > 10000) {
        alert('Maximum purchase amount is 10,000 LST tokens.');
        return;
    }
    
    const paymentAmount = tokenAmount * TOKEN_PRICE_ETH;
    
    alert(`Demo Mode: Purchase ${tokenAmount} LST tokens for ${paymentAmount.toFixed(6)} ETH\n\nIn production, this would connect to MetaMask and process the transaction on-chain.`);
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


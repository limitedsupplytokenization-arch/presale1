

// Token price in ETH (you can change this value)
const TOKEN_PRICE_ETH = 0.000045; // 0.000045 ETH per LST token

// LST Token Contract Details
const LST_TOKEN_ADDRESS = '0x1D41F2046E119A9Ad132Fc909045a02DE6E7e502';
const BASE_CHAIN_ID = '0x2105'; // Base Mainnet
const BASE_CHAIN_ID_DECIMAL = 8453;

// Fundraising variables
let totalRaised = 0; // $0 raised
const targetAmount = 143640; // $143,640 target





// Simple wallet connection variables


// Set countdown end date (48 hours from now, but paused for now)
// To start the countdown, uncomment the line below and comment out the paused line
// Universal countdown timer variables
// This will be the time when you upload to GitHub and make the site live
const COUNTDOWN_DURATION = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

// Universal countdown start time - same for all users
// This time is set when the code is deployed to GitHub
// All users will see the same countdown regardless of when they visit
const UNIVERSAL_COUNTDOWN_START_TIME = new Date('2025-09-07 12:15:00').getTime(); // Set this to your deployment time

// DOM elements
const tokenAmountInput = document.getElementById('tokenAmount');
const hoursSpan = document.getElementById('hours');
const minutesSpan = document.getElementById('minutes');
const secondsSpan = document.getElementById('seconds');

// Token calculator function
function calculatePayment() {
    if (!tokenAmountInput) return;
    
    let tokenAmount = parseFloat(tokenAmountInput.value) || 0;
    
    // Check maximum limit
    if (tokenAmount > 10000) {
        tokenAmount = 10000;
        tokenAmountInput.value = 10000;
    }
}

// Universal countdown timer function
function updateCountdown() {
    // Get DOM elements each time to ensure they exist
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    // Check if DOM elements exist
    if (!hoursElement || !minutesElement || !secondsElement) {
        console.error('Countdown DOM elements not found!', {
            hours: !!hoursElement,
            minutes: !!minutesElement,
            seconds: !!secondsElement
        });
        return;
    }

    const now = new Date().getTime();
    const elapsedTime = now - UNIVERSAL_COUNTDOWN_START_TIME;
    const remainingTime = COUNTDOWN_DURATION - elapsedTime;

    console.log('Countdown debug:', {
        now: new Date(now).toLocaleString(),
        start: new Date(UNIVERSAL_COUNTDOWN_START_TIME).toLocaleString(),
        elapsed: elapsedTime,
        remaining: remainingTime
    });

    if (remainingTime <= 0) {
        // Countdown has ended globally
        hoursElement.textContent = '00';
        minutesElement.textContent = '00';
        secondsElement.textContent = '00';
        return;
    }

    // Calculate time units
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    // Update display
    hoursElement.textContent = hours.toString().padStart(2, '0');
    minutesElement.textContent = minutes.toString().padStart(2, '0');
    secondsElement.textContent = seconds.toString().padStart(2, '0');
}

// Function to reset countdown (useful for testing or manual reset)
function resetCountdown() {
    alert('To reset countdown, update the UNIVERSAL_COUNTDOWN_START_TIME constant in the code with the current time.');
}

// Global function for manual reset
window.resetCountdown = resetCountdown;



// Button functions
function showHowItWorks() {
    const modal = document.getElementById('howItWorksModal');
    modal.style.display = 'block';
    // Trigger animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeHowItWorks() {
    const modal = document.getElementById('howItWorksModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Global functions for onclick
window.showHowItWorks = showHowItWorks;
window.closeHowItWorks = closeHowItWorks;

// Fundraising functions
function updateFundraisingDisplay() {
    const totalRaisedElement = document.querySelector('.stat-value');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    
    if (totalRaisedElement) {
        totalRaisedElement.textContent = `$${totalRaised.toLocaleString()}`;
    }
    
    if (progressFill && progressPercentage) {
        const percentage = Math.min((totalRaised / targetAmount) * 100, 100);
        progressFill.style.width = `${percentage}%`;
        progressPercentage.textContent = `${Math.round(percentage)}%`;
    }
}

// Function to update total raised amount (you can call this manually)
function updateTotalRaised(newAmount) {
    totalRaised = newAmount;
    updateFundraisingDisplay();
}

// Global function for manual updates
window.updateTotalRaised = updateTotalRaised;

// Copy address function
function copyAddress(address, buttonElement) {
    navigator.clipboard.writeText(address).then(function() {
        // Show success feedback
        const copyBtn = buttonElement || event.target;
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied';
        copyBtn.style.background = 'rgba(76, 175, 80, 0.3)';
        copyBtn.style.borderColor = 'rgba(76, 175, 80, 0.5)';
        copyBtn.style.color = '#4CAF50';
        
        setTimeout(function() {
            copyBtn.textContent = originalText;
            copyBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            copyBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            copyBtn.style.color = '#ffffff';
        }, 2000);
    }).catch(function(err) {
        console.error('Could not copy text: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = address;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Show feedback even with fallback
        const copyBtn = buttonElement || event.target;
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied';
        copyBtn.style.background = 'rgba(76, 175, 80, 0.3)';
        copyBtn.style.borderColor = 'rgba(76, 175, 80, 0.5)';
        copyBtn.style.color = '#4CAF50';
        
        setTimeout(function() {
            copyBtn.textContent = originalText;
            copyBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            copyBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            copyBtn.style.color = '#ffffff';
        }, 2000);
    });
}

// Global function for copy
window.copyAddress = copyAddress;

// Close Buy LST Modal function
function closeBuyLST() {
    const modal = document.getElementById('buyLSTModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Global function for close
window.closeBuyLST = closeBuyLST;





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
    const modal = document.getElementById('buyLSTModal');
    modal.style.display = 'block';
    // Trigger animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}



// Event listeners (if tokenAmountInput exists)
if (tokenAmountInput) {
    tokenAmountInput.addEventListener('input', function() {
        let tokenAmount = parseFloat(tokenAmountInput.value) || 0;
        
        // Check maximum limit
        if (tokenAmount > 10000) {
            tokenAmount = 10000;
            tokenAmountInput.value = 10000;
        }
    });
}




// Initialize countdown with retry mechanism
function initializeCountdown() {
    console.log('Initializing countdown...');
    
    // Try to start countdown
    updateCountdown();
    
    // If countdown elements are found, start the interval
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (hoursElement && minutesElement && secondsElement) {
        console.log('Countdown elements found, starting timer...');
        setInterval(updateCountdown, 1000);
    } else {
        console.log('Countdown elements not found, retrying in 100ms...');
        setTimeout(initializeCountdown, 100);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded, initializing...');
    initializeCountdown();
    
    // Add some interactive effects (if tokenAmountInput exists)
    if (tokenAmountInput) {
        tokenAmountInput.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        tokenAmountInput.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('howItWorksModal');
        if (event.target === modal) {
            closeHowItWorks();
        }
    });
    
    // Initialize fundraising display
    updateFundraisingDisplay();
});

// Add some visual feedback for the countdown
function addCountdownEffects() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    // Add a subtle glow effect when time is running low
    const now = new Date().getTime();
    const countdownEndDate = UNIVERSAL_COUNTDOWN_START_TIME + COUNTDOWN_DURATION;
    const distance = countdownEndDate - now;
    const minutesLeft = Math.floor(distance / (1000 * 60));
    
    if (minutesLeft <= 1) {
        countdownElement.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.3)';
    } else if (minutesLeft <= 2) {
        countdownElement.style.boxShadow = '0 0 10px rgba(255, 255, 0, 0.2)';
    } else {
        countdownElement.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.1)';
    }
}

// Call effects function periodically
setInterval(addCountdownEffects, 5000);


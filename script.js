// Privy Configuration
const PRIVY_APP_ID = 'YOUR_PRIVY_APP_ID'; // Privy App ID'nizi buraya ekleyin

// Token price in ETH (you can change this value)
const TOKEN_PRICE_ETH = 0.000045; // 0.000045 ETH per LST token

// LST Token Contract Details
const LST_TOKEN_ADDRESS = '0x1D41F2046E119A9Ad132Fc909045a02DE6E7e502';
const BASE_CHAIN_ID = '0x2105'; // Base Mainnet
const BASE_CHAIN_ID_DECIMAL = 8453;

// Presale Contract (will be updated after deployment)
const PRESALE_CONTRACT_ADDRESS = '0xb9bA8E0BC46f8d3027936e20bbC6DD438Ea1B604'; // Deployed on Base Mainnet - Immediate Start

// LST Token ABI (ERC-20 standard)
const LST_TOKEN_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    }
];

// Presale Contract ABI
const PRESALE_CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "_lstToken", "type": "address"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "ethAmount", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "tokenAmount", "type": "uint256"}
        ],
        "name": "TokensPurchased",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "buyLST",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPresaleInfo",
        "outputs": [
            {"internalType": "uint256", "name": "_soldTokens", "type": "uint256"},
            {"internalType": "uint256", "name": "_totalSupply", "type": "uint256"},
            {"internalType": "uint256", "name": "_remainingTokens", "type": "uint256"},
            {"internalType": "bool", "name": "_isActive", "type": "bool"},
            {"internalType": "uint256", "name": "_currentPrice", "type": "uint256"},
            {"internalType": "uint256", "name": "_startTime", "type": "uint256"},
            {"internalType": "uint256", "name": "_endTime", "type": "uint256"},
            {"internalType": "uint256", "name": "_currentTime", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPresaleProgress",
        "outputs": [
            {"internalType": "uint256", "name": "_soldTokens", "type": "uint256"},
            {"internalType": "uint256", "name": "_totalSupply", "type": "uint256"},
            {"internalType": "uint256", "name": "_progressPercentage", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "isPresaleActive",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Simple wallet connection variables
let currentAccount = null;
let isConnected = false;
let lstTokenContract = null;
let privy = null;

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

// Update presale progress from contract
async function updatePresaleProgress() {
    if (PRESALE_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        return; // Contract not deployed yet
    }
    
    try {
        const web3 = new Web3(window.ethereum);
        const presaleContract = new web3.eth.Contract(PRESALE_CONTRACT_ABI, PRESALE_CONTRACT_ADDRESS);
        
        const progress = await presaleContract.methods.getPresaleProgress().call();
        const soldTokens = web3.utils.fromWei(progress._soldTokens, 'ether');
        const totalSupply = web3.utils.fromWei(progress._totalSupply, 'ether');
        const progressPercentage = progress._progressPercentage;
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        // Update sold amount display
        const soldAmountElement = document.querySelector('.usd-amount');
        if (soldAmountElement) {
            soldAmountElement.textContent = `${parseInt(soldTokens).toLocaleString()} / 945,000 LST`;
        }
        
        console.log('Presale Progress Updated:', {
            soldTokens: soldTokens,
            totalSupply: totalSupply,
            progressPercentage: progressPercentage
        });
        
    } catch (error) {
        console.error('Failed to update presale progress:', error);
    }
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

async function connectWallet() {
    const statusDiv = document.getElementById('walletStatus');
    const statusMessage = document.getElementById('statusMessage');
    
    statusDiv.style.display = 'block';
    statusDiv.style.background = 'rgba(255, 255, 255, 0.1)';
    statusMessage.textContent = 'Connecting wallet...';
    
    try {
        console.log('Starting Privy wallet connection...');
        
        if (!privy) {
            throw new Error('Privy is not initialized. Please refresh the page.');
        }
        
        // Open Privy login modal
        await privy.login();
        
        console.log('Privy login initiated');
        
    } catch (error) {
        console.error('Wallet connection error:', error);
        statusDiv.style.background = 'rgba(244, 67, 54, 0.2)';
        statusMessage.textContent = `Connection failed: ${error.message}`;
    }
}

async function disconnectWallet() {
    if (!privy) {
        return;
    }

    try {
        await privy.logout();
        console.log('User disconnected from Privy');
    } catch (error) {
        console.error('Logout failed:', error);
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
        case 8453: return 'Base Mainnet';
        case 84531: return 'Base Goerli Testnet';
        default: return `Network ID: ${networkId}`;
    }
}

// Real on-chain purchase function
async function purchaseLST() {
    if (!isConnected || !currentAccount) {
        alert('Please connect your wallet first.');
        return;
    }
    
    // Check if connected to Base network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== BASE_CHAIN_ID) {
        alert('Please switch to Base network to purchase LST tokens.');
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
    
    const paymentAmount = tokenAmount * TOKEN_PRICE_ETH;
    const paymentAmountWei = '0x' + (paymentAmount * 1e18).toString(16); // Convert to Wei hex
    
    try {
        // Check if presale contract is deployed
        if (PRESALE_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000' || PRESALE_CONTRACT_ADDRESS === '') {
            alert('Presale contract not deployed yet. Please contact the team.');
            return;
        }
        
        // Create transaction to presale contract
        const transactionParameters = {
            to: PRESALE_CONTRACT_ADDRESS,
            from: currentAccount,
            value: paymentAmountWei,
            data: '0x' // buyLST() function call - empty data for payable function
        };
        
        // Send transaction
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters]
        });
        
        console.log('Transaction sent:', txHash);
        alert(`Purchase successful! Transaction hash: ${txHash}\n\nLST tokens will be automatically sent to your wallet.`);
        
        // Update progress bar after successful purchase
        setTimeout(() => {
            updatePresaleProgress();
        }, 5000); // Wait 5 seconds for transaction confirmation
        
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

// Initialize Privy
async function initializePrivy() {
    try {
        privy = new Privy({
            appId: PRIVY_APP_ID,
            config: {
                loginMethods: ['email', 'wallet'],
                appearance: {
                    theme: 'dark',
                    accentColor: '#ffffff',
                    showWalletLoginFirst: true
                },
                defaultChain: 8453, // Base Mainnet
                supportedChains: [8453] // Only Base
            }
        });
        
        await privy.init();
        console.log('Privy initialized successfully');
        
        // Listen for authentication changes
        privy.on('auth:changed', (user) => {
            if (user) {
                console.log('User authenticated:', user);
                currentAccount = user.wallet?.address;
                isConnected = true;
                updateUI();
            } else {
                console.log('User disconnected');
                currentAccount = null;
                isConnected = false;
                updateUI();
            }
        });
        
        // Update UI function
        function updateUI() {
            const connectButton = document.getElementById('connectButton');
            const purchaseButton = document.getElementById('purchaseButton');
            const statusDiv = document.getElementById('walletStatus');
            const statusMessage = document.getElementById('statusMessage');
            
            if (isConnected && currentAccount) {
                connectButton.textContent = `Connected: ${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`;
                connectButton.style.background = 'rgba(76, 175, 80, 0.8)';
                connectButton.onclick = disconnectWallet;
                purchaseButton.style.display = 'block';
                statusDiv.style.display = 'none';
                
                // Show purchase summary
                const tokenAmount = parseFloat(tokenAmountInput.value) || 0;
                const paymentAmount = tokenAmount * TOKEN_PRICE_ETH;
                
                statusMessage.textContent = `Connected! Purchase Summary:\n\nTokens: ${tokenAmount} $LST\nTotal Cost: ${paymentAmount.toFixed(6)} ETH\nAddress: ${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}\nNetwork: Base Mainnet`;
            } else {
                connectButton.textContent = 'Connect Wallet';
                connectButton.style.background = 'rgba(255, 255, 255, 0.1)';
                connectButton.onclick = connectWallet;
                purchaseButton.style.display = 'none';
                statusDiv.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Failed to initialize Privy:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Privy
    initializePrivy();
    
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

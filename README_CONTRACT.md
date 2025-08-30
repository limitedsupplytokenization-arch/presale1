# LST Token Presale Contract

## 📋 Contract Details

- **LST Token**: `0x1D41F2046E119A9Ad132Fc909045a02DE6E7e502`
- **ETH Receiver**: `0xE2e7183C1b6d53812ecCB5f1D3B48757D5d03cF4`
- **LST Distributor**: `0xE2e7183C1b6d53812ecCB5f1D3B48757D5d03cF4`
- **Presale Period**: 10-12 Eylül 2025 (48 saat)
- **Price**: 0.000045 ETH per LST
- **Total Supply**: 945,000 LST
- **Min Purchase**: 1 LST
- **Max Purchase**: 10,000 LST

## 🚀 Deployment Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp env.example .env
```

Edit `.env` file:
```env
PRIVATE_KEY=your_deployer_wallet_private_key
BASESCAN_API_KEY=your_basescan_api_key
```

### 3. Compile Contract
```bash
npm run compile
```

### 4. Deploy to Base Mainnet
```bash
npm run deploy:base
```

### 5. Verify Contract
```bash
npm run verify:base DEPLOYED_CONTRACT_ADDRESS 0x1D41F2046E119A9Ad132Fc909045a02DE6E7e502
```

## 📝 Contract Functions

### Public Functions
- `buyLST()` - Purchase LST tokens with ETH
- `getPresaleInfo()` - Get presale information
- `getPresaleProgress()` - Get presale progress
- `isPresaleActive()` - Check if presale is active

### Owner Functions
- `startPresale()` - Start the presale
- `stopPresale()` - Stop the presale
- `updatePresaleTimes()` - Update start/end times
- `updatePresalePrice()` - Update token price
- `updateTotalSupply()` - Update total supply
- `emergencyWithdrawETH()` - Emergency ETH withdrawal
- `emergencyWithdrawLST()` - Emergency LST withdrawal

## 🔧 Frontend Integration

After deployment, update the frontend with:
- **Presale Contract Address**: Deployed contract address
- **Presale Contract ABI**: Generated ABI from compilation

## ⚠️ Important Notes

1. **LST Token Approval**: LST distributor must approve the presale contract to spend LST tokens
2. **Base Network**: Contract only works on Base mainnet
3. **Time Lock**: Presale times are hardcoded (10-12 Eylül 2025)
4. **Owner Control**: Only contract owner can start/stop presale

## 🛡️ Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Only owner can control critical functions
- **Input Validation**: All inputs are validated
- **Emergency Functions**: Emergency withdrawal capabilities

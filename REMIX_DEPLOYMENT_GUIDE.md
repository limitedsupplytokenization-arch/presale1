# 🚀 Remix IDE ile LST Presale Contract Deployment

## 📋 Adım Adım Talimatlar

### **1. Remix IDE'yi Açın**
- https://remix.ethereum.org adresine gidin
- "Create New File" tıklayın
- Dosya adı: `LSTPresale.sol`

### **2. Contract Kodunu Kopyalayın**
- `LSTPresale_Remix.sol` dosyasındaki tüm kodu kopyalayın
- Remix'teki `LSTPresale.sol` dosyasına yapıştırın

### **3. Compile Edin**
- Sol panelde "Solidity Compiler" sekmesine gidin
- Compiler Version: `0.8.19` seçin
- "Compile LSTPresale.sol" butonuna tıklayın
- ✅ Compilation successful olmalı

### **4. Base Network'e Bağlanın**
- MetaMask'ta Base Mainnet'e geçin
- Remix'te "Deploy & Run Transactions" sekmesine gidin
- Environment: "Injected Provider - MetaMask" seçin
- Account: Base network'teki cüzdanınızı seçin

### **5. Contract'ı Deploy Edin**
- Contract: `LSTPresale` seçin
- Constructor Parameters:
  - `_lstToken (address)`: `0x1D41F2046E119A9Ad132Fc909045a02DE6E7e502`
- "Deploy" butonuna tıklayın
- MetaMask'ta transaction'ı onaylayın

### **6. Deployed Contract Address'ini Kaydedin**
- Deploy edilen contract'ın address'ini kopyalayın
- Bu address'i frontend'e ekleyeceğiz

### **7. Presale'i Başlatın**
- Deployed contract'ta `startPresale` fonksiyonunu çağırın
- MetaMask'ta transaction'ı onaylayın

## 📝 Contract Detayları

- **LST Token**: `0x1D41F2046E119A9Ad132Fc909045a02DE6E7e502`
- **ETH Receiver**: `0xE2e7183C1b6d53812ecCB5f1D3B48757D5d03cF4`
- **LST Distributor**: `0xE2e7183C1b6d53812ecCB5f1D3B48757D5d03cF4`
- **Presale Süresi**: 10-12 Eylül 2025 (48 saat)
- **Fiyat**: 0.000045 ETH per LST
- **Min/Max**: 1-10,000 LST

## ⚠️ Önemli Notlar

1. **Base Network**: Sadece Base mainnet'te çalışır
2. **LST Approval**: LST distributor cüzdanından contract'a approval gerekli
3. **Gas Fee**: Base network'te gas fee düşük
4. **Contract Owner**: Deploy eden kişi owner olur

## 🔧 Sonraki Adımlar

1. Contract address'ini alın
2. Frontend'i güncelleyin
3. LST approval yapın
4. Presale'i test edin

## 🆘 Sorun Giderme

- **Compilation Error**: Solidity version 0.8.19 kullandığınızdan emin olun
- **Deploy Error**: Base network'te olduğunuzdan emin olun
- **Transaction Failed**: Gas limit'i artırın

Deploy tamamlandıktan sonra contract address'ini paylaşın! 🎉

const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying LST Presale Contract...");
    
    // LST Token Contract Address (Base Mainnet)
    const LST_TOKEN_ADDRESS = "0x1D41F2046E119A9Ad132Fc909045a02DE6E7e502";
    
    // Deploy the presale contract
    const LSTPresale = await ethers.getContractFactory("LSTPresale");
    const presale = await LSTPresale.deploy(LST_TOKEN_ADDRESS);
    
    await presale.deployed();
    
    console.log("✅ LST Presale Contract deployed to:", presale.address);
    console.log("📋 Contract Details:");
    console.log("   - LST Token:", LST_TOKEN_ADDRESS);
    console.log("   - ETH Receiver:", "0xE2e7183C1b6d53812ecCB5f1D3B48757D5d03cF4");
    console.log("   - LST Distributor:", "0xE2e7183C1b6d53812ecCB5f1D3B48757D5d03cF4");
    console.log("   - Presale Start:", "10 Eylül 2025 00:00 UTC");
    console.log("   - Presale End:", "12 Eylül 2025 00:00 UTC");
    console.log("   - Price:", "0.000045 ETH per LST");
    console.log("   - Total Supply:", "945,000 LST");
    
    // Verify contract on BaseScan
    console.log("\n🔍 To verify on BaseScan:");
    console.log(`npx hardhat verify --network base ${presale.address} ${LST_TOKEN_ADDRESS}`);
    
    return presale.address;
}

main()
    .then((address) => {
        console.log("\n🎉 Deployment completed successfully!");
        console.log("Contract Address:", address);
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });

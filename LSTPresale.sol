// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LSTPresale is Ownable, ReentrancyGuard {
    IERC20 public lstToken;
    
    uint256 public presalePrice = 0.000045 ether;
    uint256 public totalPresaleSupply = 945000 * 10**18;
    uint256 public soldTokens = 0;
    
    address public ethReceiver = 0xE2e7183C1b6d53812ecCB5f1D3B48757D5d03cF4;
    address public lstDistributor = 0xE2e7183C1b6d53812ecCB5f1D3B48757D5d03cF4;
    
    // 10 Eylül 2025 00:00 UTC - 12 Eylül 2025 00:00 UTC (48 saat)
    uint256 public presaleStartTime = 1757635200; // 10 Eylül 2025 00:00 UTC
    uint256 public presaleEndTime = 1757808000;   // 12 Eylül 2025 00:00 UTC
    
    bool public presaleActive = false;
    
    event TokensPurchased(address buyer, uint256 ethAmount, uint256 tokenAmount);
    event PresaleStarted();
    event PresaleStopped();
    
    constructor(address _lstToken) {
        lstToken = IERC20(_lstToken);
    }
    
    function buyLST() public payable nonReentrant {
        require(presaleActive, "Presale is not active");
        require(block.timestamp >= presaleStartTime, "Presale not started yet");
        require(block.timestamp <= presaleEndTime, "Presale has ended");
        require(msg.value > 0, "Must send ETH");
        
        uint256 tokensToSend = (msg.value * 10**18) / presalePrice;
        require(soldTokens + tokensToSend <= totalPresaleSupply, "Presale sold out");
        require(tokensToSend >= 1 * 10**18, "Minimum 1 LST");
        require(tokensToSend <= 10000 * 10**18, "Maximum 10,000 LST");
        
        // Transfer ETH to receiver
        (bool ethSent, ) = ethReceiver.call{value: msg.value}("");
        require(ethSent, "Failed to send ETH");
        
        // Transfer LST tokens to buyer
        require(lstToken.transferFrom(lstDistributor, msg.sender, tokensToSend), "LST transfer failed");
        
        soldTokens += tokensToSend;
        
        emit TokensPurchased(msg.sender, msg.value, tokensToSend);
    }
    
    function startPresale() public onlyOwner {
        presaleActive = true;
        emit PresaleStarted();
    }
    
    function stopPresale() public onlyOwner {
        presaleActive = false;
        emit PresaleStopped();
    }
    
    function updatePresaleTimes(uint256 _startTime, uint256 _endTime) public onlyOwner {
        presaleStartTime = _startTime;
        presaleEndTime = _endTime;
    }
    
    function updatePresalePrice(uint256 _newPrice) public onlyOwner {
        presalePrice = _newPrice;
    }
    
    function updateTotalSupply(uint256 _newSupply) public onlyOwner {
        totalPresaleSupply = _newSupply;
    }
    
    function getPresaleInfo() public view returns (
        uint256 _soldTokens,
        uint256 _totalSupply,
        uint256 _remainingTokens,
        bool _isActive,
        uint256 _currentPrice,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _currentTime
    ) {
        return (
            soldTokens,
            totalPresaleSupply,
            totalPresaleSupply - soldTokens,
            presaleActive,
            presalePrice,
            presaleStartTime,
            presaleEndTime,
            block.timestamp
        );
    }
    
    function getPresaleProgress() public view returns (
        uint256 _soldTokens,
        uint256 _totalSupply,
        uint256 _progressPercentage
    ) {
        uint256 progress = (soldTokens * 100) / totalPresaleSupply;
        return (soldTokens, totalPresaleSupply, progress);
    }
    
    function isPresaleActive() public view returns (bool) {
        return presaleActive && 
               block.timestamp >= presaleStartTime && 
               block.timestamp <= presaleEndTime &&
               soldTokens < totalPresaleSupply;
    }
    
    // Emergency functions
    function emergencyWithdrawETH() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool sent, ) = ethReceiver.call{value: balance}("");
        require(sent, "Failed to withdraw ETH");
    }
    
    function emergencyWithdrawLST() public onlyOwner {
        uint256 balance = lstToken.balanceOf(address(this));
        require(lstToken.transfer(ethReceiver, balance), "Failed to withdraw LST");
    }
}

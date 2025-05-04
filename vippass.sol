// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import {
    LSP8Mintable
} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/presets/LSP8Mintable.sol";


import {
    _LSP4_TOKEN_TYPE_COLLECTION,
    _LSP4_METADATA_KEY
} from "@lukso/lsp-smart-contracts/contracts/LSP4DigitalAssetMetadata/LSP4Constants.sol";

import {
    _LSP8_TOKENID_FORMAT_NUMBER
} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";


interface IEntryPointOracle {
    function getMethodData(bytes32 methodId) external view returns (uint256);
}


contract BraveUniverseVIPPass is LSP8Mintable {
    

    uint8 public constant NO_TIER = 0;     
    uint8 public constant SILVER_TIER = 1;
    uint8 public constant GOLD_TIER = 2;
    uint8 public constant DIAMOND_TIER = 3;
    uint8 public constant UNIVERSE_TIER = 4;
    
 
    uint16 public constant SILVER_CHANCE = 450;  // %45
    uint16 public constant GOLD_CHANCE = 300;    // %30
    uint16 public constant DIAMOND_CHANCE = 200; // %20
    uint16 public constant UNIVERSE_CHANCE = 50; // %5
    
   
    address public RANDOM_ORACLE_ADDRESS = 0xDb6D3d757b8FcC73cC0f076641318d99f721Ce71;
    bytes32 public CRYPTO_RAND_METHOD_ID = 0xf1bd2bfee10cc719fb50dbbe6ca6a3a36e2786f6aab5008f8bb28038241816db;
    

    uint256 private lastOracleValue;
    uint256 private lastOracleTimestamp;
    

    bool public useBackupRandomness = true;
    
    
    mapping(bytes32 => uint8) public tokenTiers;
    
    
    mapping(address => mapping(uint8 => uint256)) public userTierCounts;
    
    mapping(uint8 => bytes) public tierMetadataURIs;
    
  
    uint256 public mintPrice = 10 ether;
    

    uint256 public constant MAX_SUPPLY = 10000;
    
   
    uint256 public totalMinted = 0;
    
    // Events
    event VIPPassMinted(address indexed to, bytes32 indexed tokenId, uint8 tier);
    event TierCountChanged(address indexed owner, uint8 tier, uint256 count);
    event MetadataSet(bytes32 indexed tokenId, bytes32 metadataKey, bytes metadataValue);
    event TierMetadataURISet(uint8 indexed tier, bytes metadataURI);
    event MintPriceChanged(uint256 oldPrice, uint256 newPrice);
    event OracleValueUpdated(uint256 value, uint256 timestamp);
    event OracleAddressChanged(address oldAddress, address newAddress);
    event OracleMethodIDChanged(bytes32 oldMethodID, bytes32 newMethodID);
    event BackupRandomnessToggled(bool enabled);
    
 
    constructor(
        address _contractOwner
    ) LSP8Mintable(
        "Brave Universe VIP Pass",  
        "BraveUniverseVIP",         
        _contractOwner,             
        _LSP4_TOKEN_TYPE_COLLECTION, 
        _LSP8_TOKENID_FORMAT_NUMBER  
    ) {
        
        _updateOracleValue();
    }
    

    

    function setOracleAddress(address newOracleAddress) external onlyOwner {
        require(newOracleAddress != address(0), "Oracle address cannot be zero address");
        address oldAddress = RANDOM_ORACLE_ADDRESS;
        RANDOM_ORACLE_ADDRESS = newOracleAddress;
        emit OracleAddressChanged(oldAddress, newOracleAddress);
    }
    
   
    function setOracleMethodID(bytes32 newMethodId) external onlyOwner {
        require(newMethodId != bytes32(0), "Method ID cannot be zero");
        bytes32 oldMethodID = CRYPTO_RAND_METHOD_ID;
        CRYPTO_RAND_METHOD_ID = newMethodId;
        emit OracleMethodIDChanged(oldMethodID, newMethodId);
    }
    

    function setUseBackupRandomness(bool enabled) external onlyOwner {
        useBackupRandomness = enabled;
        emit BackupRandomnessToggled(enabled);
    }
    

    function _updateOracleValue() internal returns (uint256) {
        try IEntryPointOracle(RANDOM_ORACLE_ADDRESS).getMethodData(CRYPTO_RAND_METHOD_ID) returns (uint256 randomValue) {
            lastOracleValue = randomValue;
            lastOracleTimestamp = block.timestamp;
            emit OracleValueUpdated(randomValue, block.timestamp);
            return randomValue;
        } catch {
           
            if (useBackupRandomness) {
                
                if (lastOracleValue == 0) {
                    lastOracleValue = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 900000000 + 100000000;
                    lastOracleTimestamp = block.timestamp;
                    emit OracleValueUpdated(lastOracleValue, block.timestamp);
                }
                return lastOracleValue;
            } else {
            
                revert("Oracle access failed and backup randomness is disabled");
            }
        }
    }
    

    function _getRandomTier(bytes32 tokenId, address sender) internal returns (uint8) {

        uint256 oracleValue = _updateOracleValue();
        
        
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(
            oracleValue,                
            block.timestamp,          
            block.prevrandao,           
            sender,                     
            tokenId,                    
            totalMinted,                
            blockhash(block.number - 1) 
        ))) % 1000;
        
        if (randomNumber < SILVER_CHANCE) {
            return SILVER_TIER; // Silver - %45
        } else if (randomNumber < SILVER_CHANCE + GOLD_CHANCE) {
            return GOLD_TIER; // Gold - %30
        } else if (randomNumber < SILVER_CHANCE + GOLD_CHANCE + DIAMOND_CHANCE) {
            return DIAMOND_TIER; // Diamond - %20
        } else {
            return UNIVERSE_TIER; // Universe - %5
        }
    }
    
 
    function setTierMetadataURI(uint8 tier, bytes memory metadataURI) external onlyOwner {
        require(tier >= SILVER_TIER && tier <= UNIVERSE_TIER, "Invalid tier");
        require(metadataURI.length > 0, "Metadata URI cannot be empty");
        
        tierMetadataURIs[tier] = metadataURI;
        emit TierMetadataURISet(tier, metadataURI);
    }
    
 
    function setAllTierMetadataURIs(bytes memory metadataURI) external onlyOwner {
        require(metadataURI.length > 0, "Metadata URI cannot be empty");
        
        for (uint8 i = SILVER_TIER; i <= UNIVERSE_TIER; i++) {
            tierMetadataURIs[i] = metadataURI;
            emit TierMetadataURISet(i, metadataURI);
        }
    }
    
  
    function getTierMetadataURI(uint8 tier) external view returns (bytes memory) {
        require(tier >= SILVER_TIER && tier <= UNIVERSE_TIER, "Invalid tier");
        return tierMetadataURIs[tier];
    }
    
 
    function mint(address to, uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than 0");
        require(totalMinted + amount <= MAX_SUPPLY, "Max supply would be exceeded");
        
        uint256 totalPrice = mintPrice * amount;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        for (uint256 i = 0; i < amount; i++) {
          
            totalMinted++;
            bytes32 tokenId = bytes32(uint256(totalMinted));
            
            
            uint8 tier = _getRandomTier(tokenId, to);
            
         
            tokenTiers[tokenId] = tier;
            
          
            bytes memory metadata = tierMetadataURIs[tier];
            require(metadata.length > 0, "Metadata not set for this tier");
            
         
            _setTokenMetadata(tokenId, metadata);
            
        
            _mint(to, tokenId, true, "");
            
            
            emit VIPPassMinted(to, tokenId, tier);
        }
        
        
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
    }
   
    function _setTokenMetadata(bytes32 tokenId, bytes memory metadataValue) internal {
        _setDataForTokenId(tokenId, _LSP4_METADATA_KEY, metadataValue);
        emit MetadataSet(tokenId, _LSP4_METADATA_KEY, metadataValue);
    }
    
   
    function setTokenMetadata(bytes32 tokenId, bytes memory metadataValue) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _setTokenMetadata(tokenId, metadataValue);
    }
    
 
    function getTokenMetadata(bytes32 tokenId) external view returns (bytes memory) {
        require(_exists(tokenId), "Token does not exist");
        return _getDataForTokenId(tokenId, _LSP4_METADATA_KEY);
    }
    
   
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
      
        super._beforeTokenTransfer(from, to, tokenId, force, data);
        
        
        if (from != address(0)) {
            uint8 tier = tokenTiers[tokenId];
           
            userTierCounts[from][tier]--;
            emit TierCountChanged(from, tier, userTierCounts[from][tier]);
        }
        
        
        if (to != address(0)) {
            uint8 tier = tokenTiers[tokenId];
            userTierCounts[to][tier]++;
            emit TierCountChanged(to, tier, userTierCounts[to][tier]);
        }
    }
    

    function getTierOfToken(bytes32 tokenId) external view returns (uint8) {
        require(_exists(tokenId), "Token does not exist");
        return tokenTiers[tokenId];
    }
    

    function getTokenCountOfTier(address owner, uint8 tier) external view returns (uint256) {
        return userTierCounts[owner][tier];
    }
    
   
    function ownsTokenOfTier(address owner, uint8 tier) external view returns (bool) {
        return userTierCounts[owner][tier] > 0;
    }
    
    
    function hasMinimumTier(address owner, uint8 minTier) external view returns (bool) {
        for (uint8 i = minTier; i <= UNIVERSE_TIER; i++) {
            if (userTierCounts[owner][i] > 0) {
                return true;
            }
        }
        return false;
    }
    
  
    function getHighestTierOwned(address owner) external view returns (uint8) {
        for (uint8 i = UNIVERSE_TIER; i >= SILVER_TIER; i--) {
            if (userTierCounts[owner][i] > 0) {
                return i;
            }
        }
        return NO_TIER;
    }
    

    function getTotalVIPPassCount(address owner) external view returns (uint256) {
        return balanceOf(owner);
    }
    
 
    function hasMinimumTierCount(address owner, uint8 tier, uint256 minCount) external view returns (bool) {
        return userTierCounts[owner][tier] >= minCount;
    }
    
  
    function getAllTierCounts(address owner) external view returns (
        uint256 silverCount,
        uint256 goldCount,
        uint256 diamondCount,
        uint256 universeCount
    ) {
        return (
            userTierCounts[owner][SILVER_TIER],
            userTierCounts[owner][GOLD_TIER],
            userTierCounts[owner][DIAMOND_TIER],
            userTierCounts[owner][UNIVERSE_TIER]
        );
    }
    
  
    function calculateTierScore(address owner) external view returns (uint256 totalScore) {
        // (Silver=1, Gold=2, Diamond=5, Universe=10)
        totalScore = 
            userTierCounts[owner][SILVER_TIER] * 1 +
            userTierCounts[owner][GOLD_TIER] * 2 +
            userTierCounts[owner][DIAMOND_TIER] * 5 +
            userTierCounts[owner][UNIVERSE_TIER] * 10;
            
        return totalScore;
    }
   
    function getOracleAge() external view returns (uint256) {
        if (lastOracleTimestamp == 0) return type(uint256).max;
        return block.timestamp - lastOracleTimestamp;
    }
    

    function getOracleData() external view returns (uint256 value, uint256 timestamp) {
        return (lastOracleValue, lastOracleTimestamp);
    }
    

    function setMintPrice(uint256 _price) external onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = _price;
        emit MintPriceChanged(oldPrice, _price);
    }
    
 
    function withdraw() external onlyOwner {
        address payable ownerPayable = payable(owner());
        (bool success, ) = ownerPayable.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
    

    function mintSpecialVIPPass(address to, uint8 tier) external onlyOwner {
        require(tier >= SILVER_TIER && tier <= UNIVERSE_TIER, "Invalid tier");
        require(totalMinted < MAX_SUPPLY, "Max supply reached");
        
        totalMinted++;
        
        
        bytes32 tokenId = bytes32(uint256(totalMinted));
     
        tokenTiers[tokenId] = tier;
        

        bytes memory metadata = tierMetadataURIs[tier];
        require(metadata.length > 0, "Metadata not set for this tier");
       
        _setTokenMetadata(tokenId, metadata);
        
        
        _mint(to, tokenId, true, "");
        
      
        emit VIPPassMinted(to, tokenId, tier);
    }
    
  
    function getTierName(uint8 tier) external pure returns (string memory) {
        if (tier == SILVER_TIER) return "Silver";
        if (tier == GOLD_TIER) return "Gold";
        if (tier == DIAMOND_TIER) return "Diamond";
        if (tier == UNIVERSE_TIER) return "Universe";
        if (tier == NO_TIER) return "No Tier";
        revert("Invalid tier");
    }
} 
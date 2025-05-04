
export const VIPPASS_CONTRACT_ADDRESS = "0x5DD5fF2562ce2De02955eebB967C6094de438428";

export const VIPPASS_CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_contractOwner",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "ERC725Y_DataKeysValuesEmptyArray",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ERC725Y_DataKeysValuesLengthMismatch",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ERC725Y_MsgValueDisallowed",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "storedData",
				"type": "bytes"
			}
		],
		"name": "InvalidExtensionAddress",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "InvalidFunctionSelector",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "LSP4TokenNameNotEditable",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "LSP4TokenSymbolNotEditable",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "LSP4TokenTypeNotEditable",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "callIndex",
				"type": "uint256"
			}
		],
		"name": "LSP8BatchCallFailed",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "LSP8CannotSendToAddressZero",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "LSP8CannotUseAddressZeroAsOperator",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "LSP8InvalidTransferBatch",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			}
		],
		"name": "LSP8NonExistentTokenId",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			}
		],
		"name": "LSP8NonExistingOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "caller",
				"type": "address"
			}
		],
		"name": "LSP8NotTokenOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenOwner",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "caller",
				"type": "address"
			}
		],
		"name": "LSP8NotTokenOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenReceiver",
				"type": "address"
			}
		],
		"name": "LSP8NotifyTokenReceiverContractMissingLSP1Interface",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenReceiver",
				"type": "address"
			}
		],
		"name": "LSP8NotifyTokenReceiverIsEOA",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			}
		],
		"name": "LSP8OperatorAlreadyAuthorized",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "caller",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "tokenOwner",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			}
		],
		"name": "LSP8RevokeOperatorNotAuthorized",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "LSP8TokenContractCannotHoldValue",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			}
		],
		"name": "LSP8TokenIdAlreadyMinted",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "LSP8TokenIdFormatNotEditable",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "LSP8TokenIdsDataEmptyArray",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "LSP8TokenIdsDataLengthMismatch",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "LSP8TokenOwnerCannotBeOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "oldOwner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "LSP8TokenOwnerChanged",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "functionSelector",
				"type": "bytes4"
			}
		],
		"name": "NoExtensionFoundForFunctionSelector",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "OwnableCannotSetZeroAddressAsOwner",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bool",
				"name": "enabled",
				"type": "bool"
			}
		],
		"name": "BackupRandomnessToggled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "dataKey",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "dataValue",
				"type": "bytes"
			}
		],
		"name": "DataChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "metadataKey",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "metadataValue",
				"type": "bytes"
			}
		],
		"name": "MetadataSet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "oldPrice",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newPrice",
				"type": "uint256"
			}
		],
		"name": "MintPriceChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "tokenOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "operatorNotificationData",
				"type": "bytes"
			}
		],
		"name": "OperatorAuthorizationChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "tokenOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "notified",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "operatorNotificationData",
				"type": "bytes"
			}
		],
		"name": "OperatorRevoked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "oldAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "newAddress",
				"type": "address"
			}
		],
		"name": "OracleAddressChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "oldMethodID",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "newMethodID",
				"type": "bytes32"
			}
		],
		"name": "OracleMethodIDChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "OracleValueUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "tier",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "count",
				"type": "uint256"
			}
		],
		"name": "TierCountChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint8",
				"name": "tier",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "metadataURI",
				"type": "bytes"
			}
		],
		"name": "TierMetadataURISet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "dataKey",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "dataValue",
				"type": "bytes"
			}
		],
		"name": "TokenIdDataChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "force",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "tier",
				"type": "uint8"
			}
		],
		"name": "VIPPassMinted",
		"type": "event"
	},
	{
		"stateMutability": "payable",
		"type": "fallback"
	},
	{
		"inputs": [],
		"name": "CRYPTO_RAND_METHOD_ID",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "DIAMOND_CHANCE",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "DIAMOND_TIER",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "GOLD_CHANCE",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "GOLD_TIER",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_SUPPLY",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "NO_TIER",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "RANDOM_ORACLE_ADDRESS",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "SILVER_CHANCE",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "SILVER_TIER",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "UNIVERSE_CHANCE",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "UNIVERSE_TIER",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "operatorNotificationData",
				"type": "bytes"
			}
		],
		"name": "authorizeOperator",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenOwner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes[]",
				"name": "data",
				"type": "bytes[]"
			}
		],
		"name": "batchCalls",
		"outputs": [
			{
				"internalType": "bytes[]",
				"name": "results",
				"type": "bytes[]"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "calculateTierScore",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "totalScore",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "getAllTierCounts",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "silverCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "goldCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "diamondCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "universeCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "dataKey",
				"type": "bytes32"
			}
		],
		"name": "getData",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "dataValue",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32[]",
				"name": "dataKeys",
				"type": "bytes32[]"
			}
		],
		"name": "getDataBatch",
		"outputs": [
			{
				"internalType": "bytes[]",
				"name": "dataValues",
				"type": "bytes[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32[]",
				"name": "tokenIds",
				"type": "bytes32[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "dataKeys",
				"type": "bytes32[]"
			}
		],
		"name": "getDataBatchForTokenIds",
		"outputs": [
			{
				"internalType": "bytes[]",
				"name": "dataValues",
				"type": "bytes[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "dataKey",
				"type": "bytes32"
			}
		],
		"name": "getDataForTokenId",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "dataValue",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "getHighestTierOwned",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			}
		],
		"name": "getOperatorsOf",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getOracleAge",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getOracleData",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "tier",
				"type": "uint8"
			}
		],
		"name": "getTierMetadataURI",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "tier",
				"type": "uint8"
			}
		],
		"name": "getTierName",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			}
		],
		"name": "getTierOfToken",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "tier",
				"type": "uint8"
			}
		],
		"name": "getTokenCountOfTier",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			}
		],
		"name": "getTokenMetadata",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "getTotalVIPPassCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "minTier",
				"type": "uint8"
			}
		],
		"name": "hasMinimumTier",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "tier",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "minCount",
				"type": "uint256"
			}
		],
		"name": "hasMinimumTierCount",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			}
		],
		"name": "isOperatorFor",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"internalType": "bool",
				"name": "force",
				"type": "bool"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "mintPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "tier",
				"type": "uint8"
			}
		],
		"name": "mintSpecialVIPPass",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "tier",
				"type": "uint8"
			}
		],
		"name": "ownsTokenOfTier",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"internalType": "bool",
				"name": "notify",
				"type": "bool"
			},
			{
				"internalType": "bytes",
				"name": "operatorNotificationData",
				"type": "bytes"
			}
		],
		"name": "revokeOperator",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "metadataURI",
				"type": "bytes"
			}
		],
		"name": "setAllTierMetadataURIs",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "dataKey",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "dataValue",
				"type": "bytes"
			}
		],
		"name": "setData",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32[]",
				"name": "dataKeys",
				"type": "bytes32[]"
			},
			{
				"internalType": "bytes[]",
				"name": "dataValues",
				"type": "bytes[]"
			}
		],
		"name": "setDataBatch",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32[]",
				"name": "tokenIds",
				"type": "bytes32[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "dataKeys",
				"type": "bytes32[]"
			},
			{
				"internalType": "bytes[]",
				"name": "dataValues",
				"type": "bytes[]"
			}
		],
		"name": "setDataBatchForTokenIds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "dataKey",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "dataValue",
				"type": "bytes"
			}
		],
		"name": "setDataForTokenId",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "setMintPrice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOracleAddress",
				"type": "address"
			}
		],
		"name": "setOracleAddress",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "newMethodId",
				"type": "bytes32"
			}
		],
		"name": "setOracleMethodID",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "tier",
				"type": "uint8"
			},
			{
				"internalType": "bytes",
				"name": "metadataURI",
				"type": "bytes"
			}
		],
		"name": "setTierMetadataURI",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "metadataValue",
				"type": "bytes"
			}
		],
		"name": "setTokenMetadata",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "enabled",
				"type": "bool"
			}
		],
		"name": "setUseBackupRandomness",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"name": "tierMetadataURIs",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenOwner",
				"type": "address"
			}
		],
		"name": "tokenIdsOf",
		"outputs": [
			{
				"internalType": "bytes32[]",
				"name": "",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			}
		],
		"name": "tokenOwnerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "tokenTiers",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalMinted",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "tokenId",
				"type": "bytes32"
			},
			{
				"internalType": "bool",
				"name": "force",
				"type": "bool"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "transfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "from",
				"type": "address[]"
			},
			{
				"internalType": "address[]",
				"name": "to",
				"type": "address[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "tokenId",
				"type": "bytes32[]"
			},
			{
				"internalType": "bool[]",
				"name": "force",
				"type": "bool[]"
			},
			{
				"internalType": "bytes[]",
				"name": "data",
				"type": "bytes[]"
			}
		],
		"name": "transferBatch",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "useBackupRandomness",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"name": "userTierCounts",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
]
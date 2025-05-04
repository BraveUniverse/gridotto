// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IEntryPointOracle {
    function getMethodData(bytes32 methodId) external view returns (uint256);
}


interface IVIPPass {
    function getHighestTierOwned(address owner) external view returns (uint8);
}

/**
 * @title Gridotto
 *
 * ██████╗ ██████╗ ██╗██████╗  ██████╗ ████████╗████████╗ ██████╗ 
 * ██╔════╝ ██╔══██╗██║██╔══██╗██╔═══██╗╚══██╔══╝╚══██╔══╝██╔═══██╗
 * ██║  ███╗██████╔╝██║██║  ██║██║   ██║   ██║      ██║   ██║   ██║
 * ██║   ██║██╔══██╗██║██║  ██║██║   ██║   ██║      ██║   ██║   ██║
 * ╚██████╔╝██║  ██║██║██████╔╝╚██████╔╝   ██║      ██║   ╚██████╔╝
 *  ╚═════╝ ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝    ╚═╝      ╚═╝    ╚═════╝ 
 */
contract Gridotto {
    address public owner;
    uint public ticketPrice = 0.1 ether;
    uint public currentDraw = 1;
    uint public currentMonthlyDraw = 1;
    uint public drawInterval = 10 minutes;
    uint public monthlyDrawInterval = 15 minutes;
    uint public drawTime;
    uint public monthlyDrawTime;
    uint public ownerFeePercent = 5;
    uint public monthlyPoolPercent = 20;
    uint public pauseTime;
    uint public constant MIN_TIME_BUFFER = 2 seconds;
    uint public constant DRAW_LOCK_PERIOD = 10 minutes;
    uint public constant MAX_BULK_BUY_ADDRESSES = 50;
    IEntryPointOracle public randomOracle;
    bytes32 constant CRYPTORAND_METHOD_ID = 0xf1bd2bfee10cc719fb50dbbe6ca6a3a36e2786f6aab5008f8bb28038241816db;
    IVIPPass public immutable vipPassContract; 
    address constant VIP_PASS_ADDRESS = 0x5DD5fF2562ce2De02955eebB967C6094de438428;
    uint8 public constant NO_TIER = 0;     
    uint8 public constant SILVER_TIER = 1;
    uint8 public constant GOLD_TIER = 2;
    uint8 public constant DIAMOND_TIER = 3;
    uint8 public constant UNIVERSE_TIER = 4;

    mapping(uint => address[]) public drawTickets;
    mapping(uint => address[]) public monthlyDrawTickets;
    mapping(uint => address) public winners;
    mapping(uint => address) public monthlyWinners;
    mapping(uint => uint) public drawPrizes;
    mapping(uint => uint) public monthlyDrawPrizes;
    
    mapping(address => uint) public pendingPrizes;
    mapping(address => uint[]) public userWonDraws;
    mapping(address => mapping(uint => uint)) public userWonPrizes;
    mapping(address => uint) public lastWinTimestamp;

    mapping(uint => mapping(address => mapping(address => uint))) public profileTicketsBoughtBy;
    mapping(uint => mapping(address => uint)) public selfBoughtTickets;
    mapping(uint => mapping(address => uint)) public othersBoughtTickets;
    mapping(uint => mapping(address => uint)) public selfBoughtMonthlyTickets;
    mapping(uint => mapping(address => uint)) public othersBoughtMonthlyTickets;

    mapping(uint => mapping(address => uint)) public drawUserTicketCount;
    mapping(uint => address[]) public drawParticipants;
    mapping(uint => mapping(address => bool)) public isParticipant;
    mapping(uint => mapping(address => uint)) public monthlyDrawUserTicketCount;
    mapping(uint => address[]) public monthlyDrawParticipants;
    mapping(uint => mapping(address => bool)) public isMonthlyParticipant;

    uint public monthlyPrizePool;
    uint public totalTicketCount;
    uint public currentDrawPrizePool;
    
    mapping(address => uint) public totalTicketsBought;
    
    bool public paused = false;
    bool private locked = false;

    mapping(uint => uint) public weeklyCleanupNextIndex;
    mapping(uint => uint) public monthlyCleanupNextIndex; 
    mapping(uint => mapping(address => bool)) public weeklyBonusClaimed;
    uint public ownerProfit;

    event TicketPurchased(address indexed buyer, address indexed profile, uint amount);
    event BulkTicketsForSelectedPurchased(address indexed buyer, uint actualCount, uint totalValue);
    event DrawCompleted(uint indexed drawNumber, address indexed winner, uint amount);
    event MonthlyDrawCompleted(uint indexed drawNumber, address indexed winner, uint amount);
    event PrizeClaimed(address indexed winner, uint amount);
    event TicketPriceChanged(uint oldPrice, uint newPrice);
    event DrawIntervalChanged(uint oldInterval, uint newInterval);
    event MonthlyDrawIntervalChanged(uint oldInterval, uint newInterval);
    event FeePercentagesChanged(uint ownerFee, uint monthlyPoolFee);
    event EmergencyStop(bool paused);
    event DrawTimeAdjusted(bool isMonthly, uint oldTime, uint newTime, int adjustment);
    event PoolFunded(bool isMonthly, uint amount, address funder);
    event DrawDataCleaned(uint indexed drawNumber); 
    event MonthlyDrawDataCleaned(uint indexed drawNumber); 
    event DrawDataBatchCleaned(uint indexed drawNumber, uint startIndex, uint endIndex); 
    event MonthlyDataBatchCleaned(uint indexed drawNumber, uint startIndex, uint endIndex);
    event BonusTicketsAdded(address indexed buyer, uint8 tier, uint bonusAmount);
    event ProfitWithdrawn(uint amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier notPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }
    
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }

    constructor() {
        owner = msg.sender;
        drawTime = block.timestamp + drawInterval;
        monthlyDrawTime = block.timestamp + monthlyDrawInterval;
        randomOracle = IEntryPointOracle(0xDb6D3d757b8FcC73cC0f076641318d99f721Ce71);
        vipPassContract = IVIPPass(VIP_PASS_ADDRESS);
    }

    // Oracle test değişkenleri
    bool public lastOracleSuccess;
    uint public lastOracleValue;
    uint public lastOracleTimestamp;
    string public lastOracleError;
    
    // Basit test için değişkenler
    uint public testRandomValue;
    bool public testSuccess;

    function buyTicket(address contextProfile, uint amount) 
        external 
        payable 
        notPaused 
        validAddress(contextProfile) 
    {
        require(msg.sender != contextProfile, " Cannot buy tickets for own profile directly");
        uint requiredValue = ticketPrice * amount;
        require(msg.value >= requiredValue, " Incorrect amount sent");
        require(amount > 0, " Amount must be greater than 0");
        require(drawTime > block.timestamp + DRAW_LOCK_PERIOD, " Ticket sales locked before draw");
        require(monthlyDrawTime > block.timestamp + DRAW_LOCK_PERIOD, " Ticket sales locked before monthly draw"); 
        uint bonusTickets = _getBonusTicketsForTier(vipPassContract.getHighestTierOwned(msg.sender));
        bool canClaimBonus = bonusTickets > 0 && !weeklyBonusClaimed[currentDraw][msg.sender];
    
        (uint ownerFee, uint monthlyPoolFee, uint drawFee) = calculateFees(requiredValue);

        ownerProfit += ownerFee;
        monthlyPrizePool += monthlyPoolFee;
        currentDrawPrizePool += drawFee;

        _processTicketPurchase(msg.sender, contextProfile, amount);
        if (canClaimBonus) {
            weeklyBonusClaimed[currentDraw][msg.sender] = true; 
            uint8 userTier = vipPassContract.getHighestTierOwned(msg.sender); 
            _addBonusTickets(msg.sender, bonusTickets); 
            emit BonusTicketsAdded(msg.sender, userTier, bonusTickets);
        }
        if (msg.value > requiredValue) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - requiredValue}("");
            require(success, " Refund failed");
        }

        emit TicketPurchased(msg.sender, contextProfile, amount);
    }

    function bulkBuyForSelectedFollowers(address[] memory _selectedAddresses)
        external
        payable
        notPaused
        nonReentrant 
    {
        uint listLength = _selectedAddresses.length;
        require(listLength > 0, " Address list cannot be empty");
        require(listLength <= MAX_BULK_BUY_ADDRESSES, " Exceeded maximum bulk buy limit (50)");

        require(drawTime > block.timestamp + DRAW_LOCK_PERIOD, " Ticket sales locked before draw");
        require(monthlyDrawTime > block.timestamp + DRAW_LOCK_PERIOD, " Ticket sales locked before monthly draw");

        uint bonusTickets = _getBonusTicketsForTier(vipPassContract.getHighestTierOwned(msg.sender));
        bool canClaimBonus = bonusTickets > 0 && !weeklyBonusClaimed[currentDraw][msg.sender];
       
        uint validRecipientCount = 0;
        for (uint i = 0; i < listLength; i++) {
            if (_selectedAddresses[i] != address(0) && _selectedAddresses[i] != msg.sender) {
                validRecipientCount++;
            }
        }
        require(validRecipientCount > 0, " No valid recipients in the provided list");

        uint totalPrice = validRecipientCount * ticketPrice;
        require(msg.value >= totalPrice, " Insufficient ETH sent");

        (uint ownerFee, uint monthlyPoolFee, uint drawFee) = calculateFees(totalPrice);

        ownerProfit += ownerFee;
        monthlyPrizePool += monthlyPoolFee;
        currentDrawPrizePool += drawFee;

        uint actualProcessedCount = 0;
        for (uint i = 0; i < listLength; i++) {
            address recipientAddress = _selectedAddresses[i];
            if (recipientAddress != address(0) && recipientAddress != msg.sender) {
                _processTicketPurchase(msg.sender, recipientAddress, 1);
                actualProcessedCount++;
            }
        }
        require(actualProcessedCount == validRecipientCount, " Internal processing count mismatch");

      
        if (canClaimBonus) {
            weeklyBonusClaimed[currentDraw][msg.sender] = true; 
            uint8 userTier = vipPassContract.getHighestTierOwned(msg.sender); 
            _addBonusTickets(msg.sender, bonusTickets); 
            emit BonusTicketsAdded(msg.sender, userTier, bonusTickets);
        }

        if (msg.value > totalPrice) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - totalPrice}("");
            require(success, " Refund failed");
        }

        emit BulkTicketsForSelectedPurchased(msg.sender, actualProcessedCount, totalPrice);
    }

    function manualDraw() external onlyOwner notPaused nonReentrant {
        drawWinner();
    }

    function manualMonthlyDraw() external onlyOwner notPaused nonReentrant {
        drawMonthlyWinner();
    }

    function adjustDrawTime(int timeAdjustment, bool isMonthly) external onlyOwner notPaused {
        require(timeAdjustment != 0, "Time adjustment must not be zero");
        
        if (isMonthly) {
            require(monthlyDrawTime > block.timestamp + MIN_TIME_BUFFER, 
                    "Too close to draw time for adjustment");
            
            uint oldTime = monthlyDrawTime;
            
            if (timeAdjustment > 0) {
                monthlyDrawTime += uint(timeAdjustment);
            } else {
                uint timeToSubtract = uint(-timeAdjustment);
                
                require(monthlyDrawTime > block.timestamp + timeToSubtract, 
                        "Cannot set draw time earlier than current time");
                
                monthlyDrawTime -= timeToSubtract;
            }
            
            emit DrawTimeAdjusted(true, oldTime, monthlyDrawTime, timeAdjustment);
        } else {
            require(drawTime > block.timestamp + MIN_TIME_BUFFER, 
                    "Too close to draw time for adjustment");
            
            uint oldTime = drawTime;
            
            if (timeAdjustment > 0) {
                drawTime += uint(timeAdjustment);
            } else {
                uint timeToSubtract = uint(-timeAdjustment);
                
                require(drawTime > block.timestamp + timeToSubtract, 
                        "Cannot set draw time earlier than current time");
                
                drawTime -= timeToSubtract;
            }
            
            emit DrawTimeAdjusted(false, oldTime, drawTime, timeAdjustment);
        }
    }

    function claimPrize() external nonReentrant {
        uint prize = pendingPrizes[msg.sender];
        require(prize > 0, "No prize available");
        
        (bool success, ) = payable(msg.sender).call{value: prize}("");
        require(success, "Transfer failed");
        
        pendingPrizes[msg.sender] = 0;
        lastWinTimestamp[msg.sender] = block.timestamp;

        emit PrizeClaimed(msg.sender, prize);
    }

    function setTicketPrice(uint newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        uint oldPrice = ticketPrice;
        ticketPrice = newPrice;
        emit TicketPriceChanged(oldPrice, newPrice);
    }
    
    function setDrawInterval(uint newInterval) external onlyOwner {
        require(newInterval > 0, "Interval must be greater than 0");
        uint oldInterval = drawInterval;
        drawInterval = newInterval;
        emit DrawIntervalChanged(oldInterval, newInterval);
    }
    
    function setMonthlyDrawInterval(uint newInterval) external onlyOwner {
        require(newInterval > 0, "Interval must be greater than 0");
        uint oldInterval = monthlyDrawInterval;
        monthlyDrawInterval = newInterval;
        emit MonthlyDrawIntervalChanged(oldInterval, newInterval);
    }
    
    function setFeePercentages(uint ownerFee, uint monthlyPoolFee) external onlyOwner {
        require(ownerFee + monthlyPoolFee <= 50, "Total fees cannot exceed 50%");
        ownerFeePercent = ownerFee;
        monthlyPoolPercent = monthlyPoolFee;
        emit FeePercentagesChanged(ownerFee, monthlyPoolFee);
    }
    
    function emergencyToggle(bool _paused) external onlyOwner {
        paused = _paused;
        
        if (_paused) {
            pauseTime = block.timestamp;
        } else {
            uint pauseDuration = block.timestamp - pauseTime;
            drawTime += pauseDuration;
            monthlyDrawTime += pauseDuration;
        }
        
        emit EmergencyStop(_paused);
    }
    
    function withdrawAll() external onlyOwner nonReentrant {
        require(paused, "Contract must be paused to withdraw all funds");
        uint balance = address(this).balance;
        
        currentDrawPrizePool = 0;
        monthlyPrizePool = 0;
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Transfer failed");
        
        emit EmergencyStop(true);
    }
    
    function withdrawProfit() external onlyOwner nonReentrant {
        uint profit = ownerProfit;
        require(profit > 0, "No profit available");
        
        ownerProfit = 0;
        
        (bool success, ) = payable(owner).call{value: profit}("");
        require(success, "Transfer failed");
        
        emit ProfitWithdrawn(profit);
    }
    
    function fundWeeklyPool() external payable onlyOwner {
        require(msg.value > 0, "Must send some ETH");
        
        currentDrawPrizePool += msg.value;
        
        emit PoolFunded(false, msg.value, msg.sender);
    }
    
    function fundMonthlyPool() external payable onlyOwner {
        require(msg.value > 0, "Must send some ETH");
        
        monthlyPrizePool += msg.value;
        
        emit PoolFunded(true, msg.value, msg.sender);
    }

    address[] public lastTwentyWinners;
    address[] public lastTwentyMonthlyWinners;
    uint private winnerIndex = 0;
    uint private monthlyWinnerIndex = 0;

    function getLastWinners() external view returns (address[] memory) {
        return lastTwentyWinners;
    }
    
    function getLastMonthlyWinners() external view returns (address[] memory) {
        return lastTwentyMonthlyWinners;
    }

    function drawWinner() internal {
        require(block.timestamp >= drawTime, " Weekly draw not ready yet");

        uint carryOverAmount = 0;
        uint prizeAmount = 0;
        address winner = address(0);
        uint drawNumber = currentDraw; 

        if (drawTickets[drawNumber].length == 0) {
            carryOverAmount = currentDrawPrizePool;
            emit DrawCompleted(drawNumber, address(0), 0);
        } else {
            winner = selectRandomWinner(drawNumber);
            winners[drawNumber] = winner;
        
            if (lastTwentyWinners.length < 20) {
                lastTwentyWinners.push(winner);
            } else {
                lastTwentyWinners[winnerIndex] = winner;
                winnerIndex = (winnerIndex + 1) % 20;
            }

            prizeAmount = (currentDrawPrizePool * 90) / 100;
            carryOverAmount = currentDrawPrizePool - prizeAmount;

            pendingPrizes[winner] += prizeAmount;
            drawPrizes[drawNumber] = prizeAmount;
            lastWinTimestamp[winner] = block.timestamp;

            _recordUserWin(winner, drawNumber, prizeAmount);

            emit DrawCompleted(drawNumber, winner, prizeAmount);
        }

        currentDraw++;
        currentDrawPrizePool = carryOverAmount; 
        drawTime = block.timestamp + drawInterval;
    }

    function drawMonthlyWinner() internal {
        require(block.timestamp >= monthlyDrawTime, " Monthly draw not ready yet");

        uint carryOverAmount = 0;
        uint prizeAmount = 0;
        address winner = address(0);
        uint drawNumber = currentMonthlyDraw; 

        if (monthlyDrawTickets[drawNumber].length == 0) {
            carryOverAmount = monthlyPrizePool;
            emit MonthlyDrawCompleted(drawNumber, address(0), 0);
        } else {
            winner = selectRandomMonthlyWinner(drawNumber);
            monthlyWinners[drawNumber] = winner;

            if (lastTwentyMonthlyWinners.length < 20) {
                lastTwentyMonthlyWinners.push(winner);
            } else {
                lastTwentyMonthlyWinners[monthlyWinnerIndex] = winner;
                monthlyWinnerIndex = (monthlyWinnerIndex + 1) % 20;
            }

            prizeAmount = (monthlyPrizePool * 90) / 100;
            carryOverAmount = monthlyPrizePool - prizeAmount;

        pendingPrizes[winner] += prizeAmount;
            monthlyDrawPrizes[drawNumber] = prizeAmount;
        lastWinTimestamp[winner] = block.timestamp;

            emit MonthlyDrawCompleted(drawNumber, winner, prizeAmount);
        }

        currentMonthlyDraw++;
        monthlyPrizePool = carryOverAmount; 
        monthlyDrawTime = block.timestamp + monthlyDrawInterval;
    }

    function _recordUserWin(address winner, uint drawNumber, uint prizeAmount) internal {
        userWonDraws[winner].push(drawNumber);
        userWonPrizes[winner][drawNumber] = prizeAmount;

        if (userWonDraws[winner].length > 20) {
            uint oldestDraw = userWonDraws[winner][0];
            delete userWonPrizes[winner][oldestDraw];

            for (uint i = 0; i < userWonDraws[winner].length - 1; i++) {
                userWonDraws[winner][i] = userWonDraws[winner][i + 1];
            }
            userWonDraws[winner].pop();
        }
    }

    function selectRandomWinner(uint drawNumber) internal view returns (address) {
        require(drawTickets[drawNumber].length > 0, "No tickets to select from");

        uint oracleRandomNumber = randomOracle.getMethodData(CRYPTORAND_METHOD_ID);

        bytes32 finalHash = keccak256(abi.encodePacked(
            oracleRandomNumber,
            blockhash(block.number - 1),
            block.timestamp,
            drawNumber,
            drawTickets[drawNumber].length
        ));

        uint winnerIndex = uint(finalHash) % drawTickets[drawNumber].length;
        return drawTickets[drawNumber][winnerIndex];
    }

    function selectRandomMonthlyWinner(uint drawNumber) internal view returns (address) {
        require(monthlyDrawTickets[drawNumber].length > 0, "No tickets to select from");

        uint oracleRandomNumber = randomOracle.getMethodData(CRYPTORAND_METHOD_ID);

        bytes32 finalHash = keccak256(abi.encodePacked(
            oracleRandomNumber,
            blockhash(block.number - 1),
            block.timestamp,
            drawNumber,
            monthlyDrawTickets[drawNumber].length
        ));

        uint winnerIndex = uint(finalHash) % monthlyDrawTickets[drawNumber].length;
        return monthlyDrawTickets[drawNumber][winnerIndex];
    }

    function calculateFees(uint amount) internal view returns (uint ownerFee, uint monthlyPoolFee, uint drawFee) {
        require(ownerFeePercent + monthlyPoolPercent <= 100, "Fee percentages exceed 100%");
        
        ownerFee = (amount * ownerFeePercent) / 100;
        monthlyPoolFee = (amount * monthlyPoolPercent) / 100;
        
        drawFee = amount - ownerFee - monthlyPoolFee;
        require(ownerFee + monthlyPoolFee + drawFee == amount, "Fee calculation error");
        
        return (ownerFee, monthlyPoolFee, drawFee);
    }

    function getCurrentDrawInfo() external view returns (
        uint drawNumber,
        uint prizePool,
        uint ticketCount,
        uint remainingTime
    ) {
        return (
            currentDraw,
            currentDrawPrizePool,
            drawTickets[currentDraw].length,
            drawTime > block.timestamp ? drawTime - block.timestamp : 0
        );
    }
    
    function getCurrentMonthlyDrawInfo() external view returns (
        uint drawNumber,
        uint prizePool,
        uint ticketCount,
        uint remainingTime
    ) {
        return (
            currentMonthlyDraw,
            monthlyPrizePool,
            monthlyDrawTickets[currentMonthlyDraw].length,
            monthlyDrawTime > block.timestamp ? monthlyDrawTime - block.timestamp : 0
        );
    }
    
    function getUserTickets(address user, uint drawNumber) external view returns (uint) {
        return drawUserTicketCount[drawNumber][user];
    }
    
    function getUserMonthlyTickets(address user, uint drawNumber) external view returns (uint) {
        return monthlyDrawUserTicketCount[drawNumber][user];
    }
    
    function getProfileTicketsBoughtBy(uint drawNumber, address profile, address buyer) external view returns (uint) {
        return profileTicketsBoughtBy[drawNumber][profile][buyer];
    }
    
    function getUserTicketsBreakdown(uint drawNumber, address user) external view returns (uint self, uint others) {
        return (selfBoughtTickets[drawNumber][user], othersBoughtTickets[drawNumber][user]);
    }
    
    function getUserWinnings(address user) external view returns (uint[] memory draws, uint[] memory amounts) {
        uint[] memory userDraws = userWonDraws[user];
        uint[] memory userAmounts = new uint[](userDraws.length);
        
        for (uint i = 0; i < userDraws.length; i++) {
            userAmounts[i] = userWonPrizes[user][userDraws[i]];
        }
        
        return (userDraws, userAmounts);
    }
    
    function getDrawResults(uint drawNumber) external view returns (address winnerAddress, uint prizeAmount) {
        require(drawNumber < currentDraw, " Draw not completed yet or invalid");
        return (winners[drawNumber], drawPrizes[drawNumber]);
    }
    
    function getMonthlyDrawResults(uint drawNumber) external view returns (address winnerAddress, uint prizeAmount) {
        require(drawNumber < currentMonthlyDraw, " Monthly draw not completed yet or invalid");
        return (monthlyWinners[drawNumber], monthlyDrawPrizes[drawNumber]);
    }
    
    function getTopBuyers() external view returns (address[] memory users, uint[] memory ticketCounts) {
        address[] memory participants = drawParticipants[currentDraw];
        
        users = participants;
        uint[] memory counts = new uint[](participants.length);
        
        for (uint i = 0; i < participants.length; i++) {
            counts[i] = totalTicketsBought[participants[i]];
        }
        
        return (users, counts);
    }
    
    function getCurrentWeeklyParticipants() external view returns (
        address[] memory participants, 
        uint[] memory totalTickets, 
        uint[] memory selfBought, 
        uint[] memory othersBought
    ) {
        participants = drawParticipants[currentDraw];
        uint participantCount = participants.length;
        
        totalTickets = new uint[](participantCount);
        selfBought = new uint[](participantCount);
        othersBought = new uint[](participantCount);
        
        for (uint i = 0; i < participantCount; i++) {
            address participant = participants[i];
            totalTickets[i] = drawUserTicketCount[currentDraw][participant];
            selfBought[i] = selfBoughtTickets[currentDraw][participant];
            othersBought[i] = othersBoughtTickets[currentDraw][participant];
        }
        
        return (participants, totalTickets, selfBought, othersBought);
    }

    function getCurrentMonthlyParticipants() external view returns (
        address[] memory participants, 
        uint[] memory totalTickets, 
        uint[] memory selfBought, 
        uint[] memory othersBought
    ) {
        participants = monthlyDrawParticipants[currentMonthlyDraw];
        uint participantCount = participants.length;
        
        totalTickets = new uint[](participantCount);
        selfBought = new uint[](participantCount);
        othersBought = new uint[](participantCount);
        
        for (uint i = 0; i < participantCount; i++) {
            address participant = participants[i];
            totalTickets[i] = monthlyDrawUserTicketCount[currentMonthlyDraw][participant];
            selfBought[i] = selfBoughtMonthlyTickets[currentMonthlyDraw][participant];
            othersBought[i] = othersBoughtMonthlyTickets[currentMonthlyDraw][participant];
        }
        
        return (participants, totalTickets, selfBought, othersBought);
    }

    function getContractInfo() external view returns (
        uint _ticketPrice,
        uint _ownerFeePercent,
        uint _monthlyPoolPercent,
        uint _totalTicketCount,
        uint _contractBalance
    ) {
        return (
            ticketPrice,
            ownerFeePercent,
            monthlyPoolPercent,
            totalTicketCount,
            address(this).balance
        );
    }
    
    function getUserPendingPrize(address user) external view returns (uint) {
        return pendingPrizes[user];
    }
    
    function getUserLastWinTime(address user) external view returns (uint) {
        return lastWinTimestamp[user];
    }
    
    function getUserTotalTickets(address user) external view returns (uint) {
        return totalTicketsBought[user];
    }
    
    function getDrawTimes() external view returns (uint _weeklyDrawTime, uint _monthlyDrawTime) {
        return (drawTime, monthlyDrawTime);
    }

    function getProfileBuyersList(uint drawNumber, address profile) external view returns (address[] memory) {
        uint count = 0;
        
        for (uint i = 0; i < drawParticipants[drawNumber].length; i++) {
            address buyer = drawParticipants[drawNumber][i];
            if (profileTicketsBoughtBy[drawNumber][profile][buyer] > 0) {
                count++;
            }
        }
        
        address[] memory buyers = new address[](count);
        uint index = 0;
        
        for (uint i = 0; i < drawParticipants[drawNumber].length; i++) {
            address buyer = drawParticipants[drawNumber][i];
            if (profileTicketsBoughtBy[drawNumber][profile][buyer] > 0) {
                buyers[index] = buyer;
                index++;
            }
        }
        
        return buyers;
    }

    function _processTicketPurchase(address buyer, address profile, uint amount) internal {
        if (!isParticipant[currentDraw][buyer]) {
            drawParticipants[currentDraw].push(buyer);
            isParticipant[currentDraw][buyer] = true;
        }
        if (!isParticipant[currentDraw][profile]) {
            drawParticipants[currentDraw].push(profile);
            isParticipant[currentDraw][profile] = true;
        }
        
        if (!isMonthlyParticipant[currentMonthlyDraw][buyer]) {
            monthlyDrawParticipants[currentMonthlyDraw].push(buyer);
            isMonthlyParticipant[currentMonthlyDraw][buyer] = true;
        }
        if (!isMonthlyParticipant[currentMonthlyDraw][profile]) {
            monthlyDrawParticipants[currentMonthlyDraw].push(profile);
            isMonthlyParticipant[currentMonthlyDraw][profile] = true;
        }

        drawUserTicketCount[currentDraw][buyer] += amount;
        drawUserTicketCount[currentDraw][profile] += amount;
        monthlyDrawUserTicketCount[currentMonthlyDraw][buyer] += amount;
        monthlyDrawUserTicketCount[currentMonthlyDraw][profile] += amount;
        
        profileTicketsBoughtBy[currentDraw][profile][buyer] += amount;
        totalTicketsBought[profile] += amount;
        
        
        if(buyer == profile) {
            selfBoughtTickets[currentDraw][profile] += amount;
            selfBoughtMonthlyTickets[currentMonthlyDraw][profile] += amount;
        } else {
            selfBoughtTickets[currentDraw][buyer] += amount; 
            selfBoughtMonthlyTickets[currentMonthlyDraw][buyer] += amount;
            
            othersBoughtTickets[currentDraw][profile] += amount; 
            othersBoughtMonthlyTickets[currentMonthlyDraw][profile] += amount;
        }

        for (uint i = 0; i < amount; i++) {
            drawTickets[currentDraw].push(buyer);
            drawTickets[currentDraw].push(profile);
            monthlyDrawTickets[currentMonthlyDraw].push(buyer);
            monthlyDrawTickets[currentMonthlyDraw].push(profile);
        }
        totalTicketCount += amount * 2;
        
        drawPrizes[currentDraw] = currentDrawPrizePool;
        monthlyDrawPrizes[currentMonthlyDraw] = monthlyPrizePool;
    }

    function _addBonusTickets(address buyer, uint bonusAmount) internal {
        require(buyer != address(0), " Invalid buyer for bonus");
        require(bonusAmount > 0, " Bonus amount must be positive");

        if (!isParticipant[currentDraw][buyer]) {
            drawParticipants[currentDraw].push(buyer);
            isParticipant[currentDraw][buyer] = true;
        }
        if (!isMonthlyParticipant[currentMonthlyDraw][buyer]) {
            monthlyDrawParticipants[currentMonthlyDraw].push(buyer);
            isMonthlyParticipant[currentMonthlyDraw][buyer] = true;
        }

        drawUserTicketCount[currentDraw][buyer] += bonusAmount;
        monthlyDrawUserTicketCount[currentMonthlyDraw][buyer] += bonusAmount;
        selfBoughtTickets[currentDraw][buyer] += bonusAmount; 
        selfBoughtMonthlyTickets[currentMonthlyDraw][buyer] += bonusAmount;

        for (uint i = 0; i < bonusAmount; i++) {
            drawTickets[currentDraw].push(buyer);
            monthlyDrawTickets[currentMonthlyDraw].push(buyer);
        }
        totalTicketCount += bonusAmount;
    }

    function _getBonusTicketsForTier(uint8 tier) internal pure returns (uint) {
         if (tier == SILVER_TIER) return 5;
         if (tier == GOLD_TIER) return 10;
         if (tier == DIAMOND_TIER) return 20;
         if (tier == UNIVERSE_TIER) return 50;
         return 0; 
    }

    function adminCleanupDrawBatch(uint drawNumber, uint batchSize) external onlyOwner nonReentrant {
        require(drawNumber < currentDraw, " Cannot clean up current or future draw");
        require(batchSize > 0, " Batch size must be positive");

        address[] storage participants = drawParticipants[drawNumber];
        uint participantCount = participants.length;
        uint startIndex = weeklyCleanupNextIndex[drawNumber];

        require(startIndex < participantCount, " Weekly draw data already fully cleaned or no participants for batch processing");

        uint endIndex = startIndex + batchSize;
        if (endIndex > participantCount) {
            endIndex = participantCount;
        }

        for (uint i = startIndex; i < endIndex; i++) {
            if (participants[i] != address(0)) {
                _cleanupParticipantData(drawNumber, participants[i]);
            }
        }

        weeklyCleanupNextIndex[drawNumber] = endIndex;

        if (endIndex == participantCount) {
            delete drawTickets[drawNumber];
            delete drawParticipants[drawNumber];
            emit DrawDataCleaned(drawNumber);
        } else {
            emit DrawDataBatchCleaned(drawNumber, startIndex, endIndex);
        }
    }

    function adminCleanupMonthlyDrawBatch(uint drawNumber, uint batchSize) external onlyOwner nonReentrant {
        require(drawNumber < currentMonthlyDraw, " Cannot clean up current or future monthly draw");
        require(batchSize > 0, " Batch size must be positive");

        address[] storage participants = monthlyDrawParticipants[drawNumber];
        uint participantCount = participants.length;
        uint startIndex = monthlyCleanupNextIndex[drawNumber];

        require(startIndex < participantCount, " Monthly draw data already fully cleaned or no participants for batch processing");

        uint endIndex = startIndex + batchSize;
        if (endIndex > participantCount) {
            endIndex = participantCount;
        }

        for (uint i = startIndex; i < endIndex; i++) {
            if (participants[i] != address(0)) {
                _cleanupMonthlyParticipantData(drawNumber, participants[i]);
            }
        }

        monthlyCleanupNextIndex[drawNumber] = endIndex;

        if (endIndex == participantCount) {
            delete monthlyDrawTickets[drawNumber];
            delete monthlyDrawParticipants[drawNumber];
            emit MonthlyDrawDataCleaned(drawNumber);
        } else {
            emit MonthlyDataBatchCleaned(drawNumber, startIndex, endIndex);
        }
    }

    function _cleanupParticipantData(uint drawNumber, address participant) internal {
         delete drawUserTicketCount[drawNumber][participant];
         delete selfBoughtTickets[drawNumber][participant];
         delete othersBoughtTickets[drawNumber][participant];
         delete isParticipant[drawNumber][participant];
         delete weeklyBonusClaimed[drawNumber][participant];
    }

    function _cleanupMonthlyParticipantData(uint drawNumber, address participant) internal {
         delete monthlyDrawUserTicketCount[drawNumber][participant];
         delete selfBoughtMonthlyTickets[drawNumber][participant];
         delete othersBoughtMonthlyTickets[drawNumber][participant];
         delete isMonthlyParticipant[drawNumber][participant]; 
    }

    // Oracle test fonksiyonu
    function testOracle() external returns (bool success, uint value, uint timestamp, string memory errorMsg) {
        try randomOracle.getMethodData(CRYPTORAND_METHOD_ID) returns (uint256 data) {
            // Test sonuçlarını kaydet
            lastOracleSuccess = true;
            lastOracleValue = data;
            lastOracleTimestamp = block.timestamp;
            lastOracleError = "";
            
            return (true, data, block.timestamp, "");
        } catch Error(string memory reason) {
            // Hata durumunda
            lastOracleSuccess = false;
            lastOracleValue = 0;
            lastOracleTimestamp = 0;
            lastOracleError = reason;
            
            return (false, 0, 0, reason);
        } catch (bytes memory) {
            // Bilinmeyen hata durumunda
            lastOracleSuccess = false;
            lastOracleValue = 0;
            lastOracleTimestamp = 0;
            lastOracleError = "Unknown error";
            
            return (false, 0, 0, "Unknown error");
        }
    }
    
    // Oracle durumunu görüntüleme fonksiyonu
    function getOracleStatus() external view returns (bool success, uint value, uint timestamp, string memory errorMsg) {
        return (lastOracleSuccess, lastOracleValue, lastOracleTimestamp, lastOracleError);
    }

    // Basit oracle test fonksiyonu
    function simpleTestOracle() external returns (uint256) {
        try randomOracle.getMethodData(CRYPTORAND_METHOD_ID) returns (uint256 value) {
            testRandomValue = value;
            testSuccess = true;
            return testRandomValue;
        } catch {
            testSuccess = false;
            return 0;
        }
    }

    // Sadece Oracle değerini çekmek için view fonksiyon
    function getOracleValue() public view returns (uint256) {
        return randomOracle.getMethodData(CRYPTORAND_METHOD_ID);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

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
    uint public drawInterval = 7 days;
    uint public monthlyDrawInterval = 30 days;
    uint public drawTime;
    uint public monthlyDrawTime;
    uint public ownerFeePercent = 5;
    uint public monthlyPoolPercent = 20;
    uint public pauseTime;
    uint public constant MIN_TIME_BUFFER = 2 seconds;
    uint public constant DRAW_LOCK_PERIOD = 10 minutes;
    uint public constant MAX_TICKETS_PER_WEEKLY_DRAW = 10000;
    uint public constant MAX_TICKETS_PER_MONTHLY_DRAW = 40000;

    // Leaderboard için kullanılacak struct
    struct UserData {
        address userAddress;
        uint ticketCount;
        uint index;
    }

    mapping(uint => address[]) public drawTickets;
    mapping(uint => address[]) public monthlyDrawTickets;
    mapping(uint => address) public winners;
    mapping(uint => address) public monthlyWinners;
    mapping(uint => uint) public drawPrizes;
    mapping(uint => uint) public monthlyDrawPrizes;
    
    mapping(address => uint) public pendingPrizes;
    mapping(uint => mapping(address => uint)) public userRandomNumbers;
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
    mapping(uint => mapping(address => uint)) public monthlyUserRandomNumbers;
    mapping(address => bool) public operators;
    
    bool public paused = false;
    bool private locked = false;

    event TicketPurchased(address indexed buyer, address indexed profile, uint amount);
    event DrawCompleted(uint indexed drawNumber, address indexed winner, uint amount);
    event MonthlyDrawCompleted(uint indexed drawNumber, address indexed winner, uint amount);
    event PrizeClaimed(address indexed winner, uint amount);
    event TicketPriceChanged(uint oldPrice, uint newPrice);
    event DrawIntervalChanged(uint oldInterval, uint newInterval);
    event MonthlyDrawIntervalChanged(uint oldInterval, uint newInterval);
    event FeePercentagesChanged(uint ownerFee, uint monthlyPoolFee);
    event EmergencyStop(bool paused);
    event DrawTimeAdjusted(bool isMonthly, uint oldTime, uint newTime, int adjustment);
    event OperatorAdded(address operator);
    event OperatorRemoved(address operator);
    event PoolFunded(bool isMonthly, uint amount, address funder);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == owner || operators[msg.sender], "Only operator can call this");
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
    }

    function buyTicket(address contextProfile, uint amount, uint randomSeed) 
        external 
        payable 
        notPaused 
        validAddress(contextProfile) 
    {
        require(msg.sender != contextProfile, "Cannot buy from own profile");
        require(msg.value == ticketPrice * amount, "Incorrect amount sent");
        require(randomSeed > 0 && randomSeed < 1000, "Random seed must be between 1-999");
        require(amount > 0, "Amount must be greater than 0");
        require(drawTime > block.timestamp + DRAW_LOCK_PERIOD, "Ticket sales locked before draw");
        require(drawTickets[currentDraw].length + amount * 2 <= MAX_TICKETS_PER_WEEKLY_DRAW, 
                "Max weekly tickets for this draw reached");
        require(monthlyDrawTickets[currentMonthlyDraw].length + amount * 2 <= MAX_TICKETS_PER_MONTHLY_DRAW, 
                "Max monthly tickets for this draw reached");

        (uint ownerFee, uint monthlyPoolFee, uint drawFee) = calculateFees(msg.value);

        monthlyPrizePool += monthlyPoolFee;
        currentDrawPrizePool += drawFee;

        totalTicketCount += amount * 2;
        totalTicketsBought[msg.sender] += amount;
        
        if (!isParticipant[currentDraw][msg.sender]) {
            drawParticipants[currentDraw].push(msg.sender);
            isParticipant[currentDraw][msg.sender] = true;
        }
        if (!isParticipant[currentDraw][contextProfile]) {
            drawParticipants[currentDraw].push(contextProfile);
            isParticipant[currentDraw][contextProfile] = true;
        }
        
        if (!isMonthlyParticipant[currentMonthlyDraw][msg.sender]) {
            monthlyDrawParticipants[currentMonthlyDraw].push(msg.sender);
            isMonthlyParticipant[currentMonthlyDraw][msg.sender] = true;
        }
        if (!isMonthlyParticipant[currentMonthlyDraw][contextProfile]) {
            monthlyDrawParticipants[currentMonthlyDraw].push(contextProfile);
            isMonthlyParticipant[currentMonthlyDraw][contextProfile] = true;
        }
        
        drawUserTicketCount[currentDraw][msg.sender] += amount;
        drawUserTicketCount[currentDraw][contextProfile] += amount;
        monthlyDrawUserTicketCount[currentMonthlyDraw][msg.sender] += amount;
        monthlyDrawUserTicketCount[currentMonthlyDraw][contextProfile] += amount;
        
        profileTicketsBoughtBy[currentDraw][contextProfile][msg.sender] += amount;
        
        selfBoughtTickets[currentDraw][msg.sender] += amount;
        othersBoughtTickets[currentDraw][contextProfile] += amount;
        
        selfBoughtMonthlyTickets[currentMonthlyDraw][msg.sender] += amount;
        othersBoughtMonthlyTickets[currentMonthlyDraw][contextProfile] += amount;

        for (uint i = 0; i < amount; i++) {
            drawTickets[currentDraw].push(msg.sender);
            drawTickets[currentDraw].push(contextProfile);
            monthlyDrawTickets[currentMonthlyDraw].push(msg.sender);
            monthlyDrawTickets[currentMonthlyDraw].push(contextProfile);
        }

        userRandomNumbers[currentDraw][msg.sender] = randomSeed;
        monthlyUserRandomNumbers[currentMonthlyDraw][msg.sender] = randomSeed;

        emit TicketPurchased(msg.sender, contextProfile, amount);
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

    function claimPrize() external notPaused nonReentrant {
        uint prize = pendingPrizes[msg.sender];
        require(prize > 0, "No prize available");
        
        (bool success, ) = payable(msg.sender).call{value: prize}("");
        require(success, "Transfer failed");
        
        pendingPrizes[msg.sender] = 0;
        lastWinTimestamp[msg.sender] = block.timestamp;

        emit PrizeClaimed(msg.sender, prize);
    }
    
    function manualDraw() external onlyOperator notPaused {
        drawWinner();
    }
    
    function manualMonthlyDraw() external onlyOperator notPaused {
            drawMonthlyWinner();
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
        uint profit = address(this).balance - currentDrawPrizePool - monthlyPrizePool;
        require(profit > 0, "No profit available");
        
        (bool success, ) = payable(owner).call{value: profit}("");
        require(success, "Transfer failed");
    }
    
    function addOperator(address operator) external onlyOwner validAddress(operator) {
        operators[operator] = true;
        emit OperatorAdded(operator);
    }
    
    function removeOperator(address operator) external onlyOwner {
        operators[operator] = false;
        emit OperatorRemoved(operator);
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

    function drawWinner() internal {
        require(block.timestamp >= drawTime, "Weekly draw not ready yet");

        if (drawTickets[currentDraw].length == 0) {
            uint nextDrawPrizePool = currentDrawPrizePool;
            
            currentDraw++;
            drawTime = block.timestamp + drawInterval;
            
            currentDrawPrizePool = nextDrawPrizePool;
            
            emit DrawCompleted(currentDraw - 1, address(0), 0);
            return;
        }

        address winner = selectRandomWinner(currentDraw);
        winners[currentDraw] = winner;
        
        if (lastFiftyWinners.length < 50) {
            lastFiftyWinners.push(winner);
        } else {
            lastFiftyWinners[winnerIndex] = winner;
        }
        winnerIndex = (winnerIndex + 1) % 50;

        uint prizeAmount = currentDrawPrizePool;
        pendingPrizes[winner] += prizeAmount;
        drawPrizes[currentDraw] = prizeAmount;
        lastWinTimestamp[winner] = block.timestamp;

        userWonDraws[winner].push(currentDraw);
        userWonPrizes[winner][currentDraw] = prizeAmount;

        if (userWonDraws[winner].length > 20) {
            uint oldestDraw = userWonDraws[winner][0];
            delete userWonPrizes[winner][oldestDraw];

            for (uint i = 0; i < userWonDraws[winner].length - 1; i++) {
                userWonDraws[winner][i] = userWonDraws[winner][i + 1];
            }
            userWonDraws[winner].pop();
        }

        cleanupDrawData(currentDraw);

        emit DrawCompleted(currentDraw, winner, prizeAmount);

        currentDraw++;
        currentDrawPrizePool = 0;
        drawTime = block.timestamp + drawInterval;
    }

    function drawMonthlyWinner() internal {
        require(block.timestamp >= monthlyDrawTime, "Monthly draw not ready yet");

        if (monthlyDrawTickets[currentMonthlyDraw].length == 0) {
            uint nextMonthlyPrizePool = monthlyPrizePool;
            
            currentMonthlyDraw++;
            monthlyDrawTime = block.timestamp + monthlyDrawInterval;
            
            monthlyPrizePool = nextMonthlyPrizePool;
            
            emit MonthlyDrawCompleted(currentMonthlyDraw - 1, address(0), 0);
            return;
        }

        address winner = selectRandomMonthlyWinner(currentMonthlyDraw);
        monthlyWinners[currentMonthlyDraw] = winner;

        if (lastFiftyMonthlyWinners.length < 50) {
            lastFiftyMonthlyWinners.push(winner);
        } else {
            lastFiftyMonthlyWinners[monthlyWinnerIndex] = winner;
        }
        monthlyWinnerIndex = (monthlyWinnerIndex + 1) % 50;

        uint prizeAmount = monthlyPrizePool;
        pendingPrizes[winner] += prizeAmount;
        monthlyDrawPrizes[currentMonthlyDraw] = prizeAmount;
        lastWinTimestamp[winner] = block.timestamp;
        
        emit MonthlyDrawCompleted(currentMonthlyDraw, winner, prizeAmount);

        cleanupMonthlyDrawData(currentMonthlyDraw);

        monthlyPrizePool = 0;
        currentMonthlyDraw++;
        monthlyDrawTime = block.timestamp + monthlyDrawInterval;
    }

    function cleanupDrawData(uint drawNumber) internal {
        delete drawTickets[drawNumber];
        
        for (uint i = 0; i < drawParticipants[drawNumber].length; i++) {
            address participant = drawParticipants[drawNumber][i];
            delete userRandomNumbers[drawNumber][participant];
            delete drawUserTicketCount[drawNumber][participant];
            
            delete selfBoughtTickets[drawNumber][participant];
            delete othersBoughtTickets[drawNumber][participant];
            
            for (uint j = 0; j < drawParticipants[drawNumber].length; j++) {
                address profile = drawParticipants[drawNumber][j];
                delete profileTicketsBoughtBy[drawNumber][profile][participant];
            }
        }
        
        delete drawParticipants[drawNumber];
    }
    
    function cleanupMonthlyDrawData(uint drawNumber) internal {
        delete monthlyDrawTickets[drawNumber];
        
        for (uint i = 0; i < monthlyDrawParticipants[drawNumber].length; i++) {
            address participant = monthlyDrawParticipants[drawNumber][i];
            delete monthlyDrawUserTicketCount[drawNumber][participant];
            delete monthlyUserRandomNumbers[drawNumber][participant];
            delete selfBoughtMonthlyTickets[drawNumber][participant];
            delete othersBoughtMonthlyTickets[drawNumber][participant];
        }
        
        delete monthlyDrawParticipants[drawNumber];
    }

    function selectRandomWinner(uint drawNumber) internal view returns (address) {
        bytes32 combinedHash;

        for (uint i = 0; i < drawTickets[drawNumber].length; i++) {
            combinedHash = keccak256(abi.encodePacked(
                combinedHash,
                drawTickets[drawNumber][i],
                userRandomNumbers[drawNumber][drawTickets[drawNumber][i]]
            ));
        }

        bytes32 finalHash = keccak256(abi.encodePacked(
            combinedHash,
            blockhash(block.number - 1),
            block.timestamp
        ));

        return drawTickets[drawNumber][uint(finalHash) % drawTickets[drawNumber].length];
    }

    function selectRandomMonthlyWinner(uint drawNumber) internal view returns (address) {
        bytes32 combinedHash;

        for (uint i = 0; i < monthlyDrawTickets[drawNumber].length; i++) {
            address participant = monthlyDrawTickets[drawNumber][i];
            
            uint randomSeed = monthlyUserRandomNumbers[drawNumber][participant];
            if (randomSeed == 0) {
                continue;
            }
            
            combinedHash = keccak256(abi.encodePacked(
                combinedHash,
                participant,
                randomSeed
            ));
        }

        bytes32 finalHash = keccak256(abi.encodePacked(
            combinedHash,
            blockhash(block.number - 1),
            block.timestamp
        ));

        return monthlyDrawTickets[drawNumber][uint(finalHash) % monthlyDrawTickets[drawNumber].length];
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
        return (winners[drawNumber], drawPrizes[drawNumber]);
    }
    
    function getMonthlyDrawResults(uint drawNumber) external view returns (address winnerAddress, uint prizeAmount) {
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
    
    function getCurrentWeeklyDetailedTopBuyers(uint maxCount) external view 
    returns (
        address[] memory users, 
        uint[] memory totalTickets, 
        uint[] memory selfBought, 
        uint[] memory othersBought
    ) {
        return getWeeklyDetailedTopBuyers(currentDraw, maxCount);
    }

    function getCurrentMonthlyDetailedTopBuyers(uint maxCount) external view 
    returns (
        address[] memory users, 
        uint[] memory totalTickets, 
        uint[] memory selfBought, 
        uint[] memory othersBought
    ) {
        return getMonthlyDetailedTopBuyers(currentMonthlyDraw, maxCount);
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

    address[] public lastFiftyWinners;
    address[] public lastFiftyMonthlyWinners;
    uint private winnerIndex = 0;
    uint private monthlyWinnerIndex = 0;

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

    function getLastFiftyWinners() external view returns (address[] memory) {
        return lastFiftyWinners;
    }
    
    function getLastFiftyMonthlyWinners() external view returns (address[] memory) {
        return lastFiftyMonthlyWinners;
    }

    function getWeeklyDetailedTopBuyers(uint drawNumber, uint maxCount) public view 
    returns (
        address[] memory users, 
        uint[] memory totalTickets, 
        uint[] memory selfBought, 
        uint[] memory othersBought
    ) {
        address[] memory participants = drawParticipants[drawNumber];
        
        if (participants.length == 0) {
            return (new address[](0), new uint[](0), new uint[](0), new uint[](0));
        }
        
        uint resultCount = participants.length > maxCount ? maxCount : participants.length;
        
        address[] memory tempUsers = new address[](participants.length);
        uint[] memory tempCounts = new uint[](participants.length);
        
        for (uint i = 0; i < participants.length; i++) {
            tempUsers[i] = participants[i];
            tempCounts[i] = drawUserTicketCount[drawNumber][participants[i]];
        }
        
        for (uint i = 0; i < participants.length; i++) {
            for (uint j = 0; j < participants.length - i - 1; j++) {
                if (tempCounts[j] < tempCounts[j + 1]) {
                    address tempUser = tempUsers[j];
                    tempUsers[j] = tempUsers[j + 1];
                    tempUsers[j + 1] = tempUser;
                    
                    uint tempCount = tempCounts[j];
                    tempCounts[j] = tempCounts[j + 1];
                    tempCounts[j + 1] = tempCount;
                }
            }
        }
        
        users = new address[](resultCount);
        totalTickets = new uint[](resultCount);
        selfBought = new uint[](resultCount);
        othersBought = new uint[](resultCount);
        
        for (uint i = 0; i < resultCount; i++) {
            users[i] = tempUsers[i];
            totalTickets[i] = tempCounts[i];
            selfBought[i] = selfBoughtTickets[drawNumber][tempUsers[i]];
            othersBought[i] = othersBoughtTickets[drawNumber][tempUsers[i]];
        }
        
        return (users, totalTickets, selfBought, othersBought);
    }

    function getMonthlyDetailedTopBuyers(uint drawNumber, uint maxCount) public view 
    returns (
        address[] memory users, 
        uint[] memory totalTickets, 
        uint[] memory selfBought, 
        uint[] memory othersBought
    ) {
        address[] memory participants = monthlyDrawParticipants[drawNumber];
        
        if (participants.length == 0) {
            return (new address[](0), new uint[](0), new uint[](0), new uint[](0));
        }
        
        uint resultCount = participants.length > maxCount ? maxCount : participants.length;
        
        address[] memory tempUsers = new address[](participants.length);
        uint[] memory tempCounts = new uint[](participants.length);
        
        for (uint i = 0; i < participants.length; i++) {
            tempUsers[i] = participants[i];
            tempCounts[i] = monthlyDrawUserTicketCount[drawNumber][participants[i]];
        }
        
        for (uint i = 0; i < participants.length; i++) {
            for (uint j = 0; j < participants.length - i - 1; j++) {
                if (tempCounts[j] < tempCounts[j + 1]) {
                    address tempUser = tempUsers[j];
                    tempUsers[j] = tempUsers[j + 1];
                    tempUsers[j + 1] = tempUser;
                    
                    uint tempCount = tempCounts[j];
                    tempCounts[j] = tempCounts[j + 1];
                    tempCounts[j + 1] = tempCount;
                }
            }
        }
        
        users = new address[](resultCount);
        totalTickets = new uint[](resultCount);
        selfBought = new uint[](resultCount);
        othersBought = new uint[](resultCount);
        
        for (uint i = 0; i < resultCount; i++) {
            users[i] = tempUsers[i];
            totalTickets[i] = tempCounts[i];
            selfBought[i] = selfBoughtMonthlyTickets[drawNumber][tempUsers[i]];
            othersBought[i] = othersBoughtMonthlyTickets[drawNumber][tempUsers[i]];
        }
        
        return (users, totalTickets, selfBought, othersBought);
    }
}
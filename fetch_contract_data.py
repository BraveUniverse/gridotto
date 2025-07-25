#!/usr/bin/env python3
"""
Contract Data Fetcher for Gridotto
Fetches real data from LUKSO testnet and generates JSON for UI
"""

import json
import requests
from web3 import Web3
from datetime import datetime

# LUKSO Testnet RPC
RPC_URL = "https://rpc.testnet.lukso.network"
CONTRACT_ADDRESS = "0x5Ad808FAE645BA3682170467114e5b80A70bF276"

# Simplified ABI - only view functions we need
CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "getNextDrawId",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"type": "uint256"}],
        "name": "getDrawDetails",
        "outputs": [
            {"type": "address", "name": "creator"},
            {"type": "uint8", "name": "drawType"},
            {"type": "address", "name": "tokenAddress"},
            {"type": "uint256", "name": "ticketPrice"},
            {"type": "uint256", "name": "maxTickets"},
            {"type": "uint256", "name": "ticketsSold"},
            {"type": "uint256", "name": "prizePool"},
            {"type": "uint256", "name": "startTime"},
            {"type": "uint256", "name": "endTime"},
            {"type": "uint256", "name": "minParticipants"},
            {"type": "uint256", "name": "platformFeePercent"},
            {"type": "bool", "name": "isCompleted"},
            {"type": "bool", "name": "isCancelled"},
            {"type": "uint256", "name": "participantCount"},
            {"type": "uint256", "name": "monthlyPoolContribution"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPlatformDrawsInfo",
        "outputs": [
            {"type": "uint256", "name": "weeklyDrawId"},
            {"type": "uint256", "name": "monthlyDrawId"},
            {"type": "uint256", "name": "monthlyPoolBalance"},
            {"type": "uint256", "name": "lastWeeklyDrawTime"},
            {"type": "uint256", "name": "nextMonthlyDraw"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPlatformStatistics",
        "outputs": [
            {"type": "uint256", "name": "totalPrizesDistributed"},
            {"type": "uint256", "name": "totalTicketsSold"},
            {"type": "uint256", "name": "totalDrawsCreated"},
            {"type": "uint256", "name": "totalExecutions"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

def connect_web3():
    """Connect to LUKSO testnet"""
    try:
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        if w3.is_connected():
            print(f"✅ Connected to LUKSO testnet")
            print(f"Latest block: {w3.eth.block_number}")
            return w3
        else:
            print("❌ Failed to connect to LUKSO testnet")
            return None
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return None

def get_contract_data():
    """Fetch all contract data"""
    w3 = connect_web3()
    if not w3:
        return None
    
    try:
        # Create contract instance
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(CONTRACT_ADDRESS),
            abi=CONTRACT_ABI
        )
        
        print(f"📝 Contract address: {CONTRACT_ADDRESS}")
        
        data = {
            "timestamp": datetime.now().isoformat(),
            "contract_address": CONTRACT_ADDRESS,
            "network": "LUKSO Testnet",
            "platform_info": None,
            "platform_stats": None,
            "active_draws": [],
            "total_draws_checked": 0,
            "errors": []
        }
        
        # 1. Get platform draws info
        try:
            print("🔍 Fetching platform draws info...")
            platform_info = contract.functions.getPlatformDrawsInfo().call()
            data["platform_info"] = {
                "weeklyDrawId": int(platform_info[0]),
                "monthlyDrawId": int(platform_info[1]),
                "monthlyPoolBalance": str(platform_info[2]),
                "monthlyPoolBalance_LYX": float(w3.from_wei(platform_info[2], 'ether')),
                "lastWeeklyDrawTime": int(platform_info[3]),
                "nextMonthlyDraw": int(platform_info[4])
            }
            print(f"  ✅ Platform info retrieved")
        except Exception as e:
            print(f"  ❌ Platform info error: {e}")
            data["errors"].append(f"Platform info: {str(e)}")
        
        # 2. Get platform statistics
        try:
            print("📊 Fetching platform statistics...")
            stats = contract.functions.getPlatformStatistics().call()
            data["platform_stats"] = {
                "totalPrizesDistributed": str(stats[0]),
                "totalPrizesDistributed_LYX": float(w3.from_wei(stats[0], 'ether')),
                "totalTicketsSold": int(stats[1]),
                "totalDrawsCreated": int(stats[2]),
                "totalExecutions": int(stats[3])
            }
            print(f"  ✅ Platform stats retrieved")
        except Exception as e:
            print(f"  ❌ Platform stats error: {e}")
            data["errors"].append(f"Platform stats: {str(e)}")
        
        # 3. Get next draw ID
        try:
            print("🎯 Getting next draw ID...")
            next_draw_id = contract.functions.getNextDrawId().call()
            print(f"  📈 Next draw ID: {next_draw_id}")
            
            # 4. Fetch details for existing draws
            if next_draw_id > 1:
                print(f"🎲 Fetching details for draws 1 to {next_draw_id-1}...")
                for draw_id in range(1, min(next_draw_id, 11)):  # Limit to first 10 draws
                    try:
                        print(f"  🔍 Fetching draw #{draw_id}...")
                        draw_details = contract.functions.getDrawDetails(draw_id).call()
                        
                        # Check if draw is active (not completed, not cancelled, end time in future)
                        is_active = (
                            not draw_details[11] and  # not isCompleted
                            not draw_details[12] and  # not isCancelled
                            draw_details[8] > w3.eth.get_block('latest')['timestamp']  # endTime > now
                        )
                        
                        draw_data = {
                            "drawId": draw_id,
                            "creator": draw_details[0],
                            "drawType": int(draw_details[1]),
                            "drawTypeName": ["LYX", "LSP7", "LSP8", "WEEKLY", "MONTHLY"][int(draw_details[1])],
                            "tokenAddress": draw_details[2],
                            "ticketPrice": str(draw_details[3]),
                            "ticketPrice_LYX": float(w3.from_wei(draw_details[3], 'ether')),
                            "maxTickets": int(draw_details[4]),
                            "ticketsSold": int(draw_details[5]),
                            "prizePool": str(draw_details[6]),
                            "prizePool_LYX": float(w3.from_wei(draw_details[6], 'ether')),
                            "startTime": int(draw_details[7]),
                            "endTime": int(draw_details[8]),
                            "minParticipants": int(draw_details[9]),
                            "platformFeePercent": int(draw_details[10]),
                            "isCompleted": draw_details[11],
                            "isCancelled": draw_details[12],
                            "participantCount": int(draw_details[13]),
                            "monthlyPoolContribution": str(draw_details[14]),
                            "isActive": is_active,
                            "timeRemaining": max(0, int(draw_details[8]) - w3.eth.get_block('latest')['timestamp'])
                        }
                        
                        data["active_draws"].append(draw_data)
                        data["total_draws_checked"] += 1
                        print(f"    ✅ Draw #{draw_id}: {'Active' if is_active else 'Inactive'}")
                        
                    except Exception as e:
                        print(f"    ❌ Error fetching draw #{draw_id}: {e}")
                        data["errors"].append(f"Draw {draw_id}: {str(e)}")
            else:
                print("  📭 No draws created yet")
                
        except Exception as e:
            print(f"❌ Error getting draws: {e}")
            data["errors"].append(f"Draw fetching: {str(e)}")
        
        # Calculate summary stats
        active_draws = [d for d in data["active_draws"] if d["isActive"]]
        total_active_prize = sum(d["prizePool_LYX"] for d in active_draws)
        total_participants = sum(d["participantCount"] for d in data["active_draws"])
        avg_ticket_price = sum(d["ticketPrice_LYX"] for d in data["active_draws"]) / len(data["active_draws"]) if data["active_draws"] else 0.1
        
        data["summary"] = {
            "total_active_draws": len(active_draws),
            "total_active_prize_pool_LYX": total_active_prize,
            "total_participants": total_participants,
            "average_ticket_price_LYX": avg_ticket_price
        }
        
        print(f"\n📋 Summary:")
        print(f"  🎯 Active draws: {len(active_draws)}")
        print(f"  💰 Total active prize pool: {total_active_prize:.4f} LYX")
        print(f"  👥 Total participants: {total_participants}")
        print(f"  🎫 Average ticket price: {avg_ticket_price:.4f} LYX")
        
        return data
        
    except Exception as e:
        print(f"❌ Contract error: {e}")
        return None

def save_data(data, filename="contract_data.json"):
    """Save data to JSON file"""
    try:
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"💾 Data saved to {filename}")
        return True
    except Exception as e:
        print(f"❌ Error saving data: {e}")
        return False

def main():
    print("🚀 Gridotto Contract Data Fetcher")
    print("=" * 50)
    
    data = get_contract_data()
    if data:
        if save_data(data):
            print("\n✅ Contract data fetch completed successfully!")
            
            # Display key info
            if data["summary"]:
                print(f"\n🎯 Quick Stats:")
                print(f"  Active Draws: {data['summary']['total_active_draws']}")
                print(f"  Prize Pool: {data['summary']['total_active_prize_pool_LYX']:.4f} LYX")
                print(f"  Participants: {data['summary']['total_participants']}")
            
            if data["errors"]:
                print(f"\n⚠️  Errors encountered: {len(data['errors'])}")
                for error in data["errors"]:
                    print(f"    - {error}")
        else:
            print("\n❌ Failed to save data")
    else:
        print("\n❌ Failed to fetch contract data")

if __name__ == "__main__":
    main()
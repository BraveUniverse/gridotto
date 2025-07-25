'use client';

import Link from 'next/link';
import contractData from '@/data/contractData.json';

export function ActiveDrawsSection() {
  const activeDraws = contractData.active_draws.filter(draw => draw.isActive);
  
  const formatTimeRemaining = (timeRemaining: number) => {
    if (timeRemaining <= 0) return 'Ended';
    
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }
    
    return `${hours}h ${minutes}m left`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-pink-400">
          Active Community Draws
        </h2>
        
        {activeDraws.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No active draws at the moment</p>
            <Link
              href="/create-draw"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Create a Draw
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDraws.map((draw) => (
                <div
                  key={draw.drawId}
                  className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-pink-500/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {draw.drawTypeName} Draw #{draw.drawId}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {formatTimeRemaining(draw.timeRemaining)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-400">
                        {draw.prizePool_LYX.toFixed(4)} LYX
                      </p>
                      <p className="text-xs text-gray-400">Prize Pool</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">Created by</p>
                    <p className="text-white font-mono text-sm">
                      {formatAddress(draw.creator)}
                    </p>
                  </div>

                  <div className="flex justify-between text-sm text-gray-400 mb-4">
                    <span>{draw.ticketsSold} tickets sold</span>
                    <span>{draw.ticketPrice_LYX.toFixed(4)} LYX per ticket</span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mb-4">
                    <span>Participants: {draw.participantCount}</span>
                    <span>Max: {draw.maxTickets > 1000000 ? '∞' : draw.maxTickets}</span>
                  </div>

                  <Link
                    href={`/draws/${draw.drawId}`}
                    className="block w-full text-center py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/draws"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                View All Draws ({contractData.active_draws.length})
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
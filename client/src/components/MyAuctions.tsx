import React, { useState, useEffect } from 'react';
import type { NFT, Auction, AuctionStatus } from '../types';

interface AuctionWithBid extends Omit<Auction, 'sellerId'> {
  startingBid: number;
  currentBid?: number;
  reservePrice?: number;
  endTime: string;
  winnerId?: { _id: string; username: string };
}

interface Bid {
  _id: string;
  auctionId: {
    _id: string;
    nftId: NFT;
    auctionStatus: AuctionStatus;
    endTime: string;
    winnerId?: { _id: string; username: string };
  };
  bidAmount: number;
  bidTime: string;
  isAutobid: boolean;
}

interface MyAuctionsProps {
  onClose: () => void;
}

const MyAuctions: React.FC<MyAuctionsProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'selling' | 'bidding'>('selling');
  const [myAuctions, setMyAuctions] = useState<AuctionWithBid[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      const [auctionsResponse, bidsResponse] = await Promise.all([
        fetch('http://localhost:3000/api/auctions/my-auctions', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/auctions/my-bids', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!auctionsResponse.ok || !bidsResponse.ok) {
        throw new Error('Failed to fetch auction data');
      }

      const [auctions, bids] = await Promise.all([
        auctionsResponse.json(),
        bidsResponse.json()
      ]);

      setMyAuctions(auctions);
      setMyBids(bids);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNFTDescription = (nft: Pick<NFT, 'color' | 'thing' | 'props' | 'isFirstOfSet'>) => {
    let description = '';
    
    if (nft.isFirstOfSet) {
      description += '**FIRST OF SET** ';
    }
    
    description += nft.color;
    description += ` ${nft.thing}`;
    
    if (nft.props && nft.props.length > 0) {
      const propDescriptions = nft.props.map(prop => prop.name).join(', ');
      description += ` with ${propDescriptions}`;
    }
    
    return description;
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      'common': '#6c757d',
      'uncommon': '#28a745', 
      'rare': '#007bff',
      'veryRare': '#6f42c1',
      'notPresent': '#6c757d'
    };
    return colors[rarity as keyof typeof colors] || '#6c757d';
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const difference = end - now;

    if (difference <= 0) return 'Ended';

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getAuctionTypeIcon = (type: string) => {
    const icons = {
      'standard': '🔨',
      'dutch': '⚡',
      'reserve': '💎'
    };
    return icons[type as keyof typeof icons] || '🔨';
  };

  const getBidStatus = (bid: Bid) => {
    const auction = bid.auctionId;
    if (auction.auctionStatus === 'ended') {
      if (auction.winnerId?._id) {
        // Check if current user won (we'd need to compare with current user ID)
        return { status: 'Won', color: '#28a745' };
      } else {
        return { status: 'Lost', color: '#dc3545' };
      }
    } else if (auction.auctionStatus === 'cancelled') {
      return { status: 'Cancelled', color: '#6c757d' };
    } else {
      return { status: 'Active', color: '#007bff' };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
        <div className="bg-white p-5 rounded-lg text-center">
          Loading auction data...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
      <div className="bg-white p-5 rounded-lg w-[90%] max-w-[800px] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="m-0 text-2xl font-bold">My Auction Activity</h2>
          <button 
            onClick={onClose}
            className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="text-red-600 mb-5 text-center">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-5">
          <div className="flex border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('selling')}
              className={`px-5 py-2.5 border-none bg-transparent cursor-pointer text-base ${
                activeTab === 'selling' 
                  ? 'border-b-2 border-blue-600 text-blue-600 font-bold' 
                  : 'text-gray-500 font-normal'
              }`}
            >
              🏪 My Auctions ({myAuctions.length})
            </button>
            <button
              onClick={() => setActiveTab('bidding')}
              className={`px-5 py-2.5 border-none bg-transparent cursor-pointer text-base ${
                activeTab === 'bidding' 
                  ? 'border-b-2 border-blue-600 text-blue-600 font-bold' 
                  : 'text-gray-500 font-normal'
              }`}
            >
              🎯 My Bids ({myBids.length})
            </button>
          </div>
        </div>

        {/* My Auctions Tab */}
        {activeTab === 'selling' && (
          <div>
            {myAuctions.length === 0 ? (
              <p className="text-center text-gray-500 py-10">
                You haven't created any auctions yet.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {myAuctions.map((auction) => (
                  <div key={auction._id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2.5">
                      <div>
                        <h4 className="m-0 mb-1.5 text-gray-700">
                          {getAuctionTypeIcon(auction.auctionType)} {formatNFTDescription(auction.nftId)}
                        </h4>
                        <div className="text-xs text-gray-500 mb-1.5">
                          <span style={{ color: getRarityColor(auction.nftId.colorRarity) }}>
                            Color: {auction.nftId.colorRarity}
                          </span>
                          {auction.nftId.propRarity !== 'notPresent' && (
                            <>
                              {' • '}
                              <span style={{ color: getRarityColor(auction.nftId.propRarity) }}>
                                Props: {auction.nftId.propRarity}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`text-white px-2 py-1 rounded text-xs ${
                        auction.auctionStatus === 'active' ? 'bg-green-600' : 
                        auction.auctionStatus === 'ended' ? 'bg-blue-600' : 'bg-gray-500'
                      }`}>
                        {auction.auctionStatus.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm mb-1.5">
                          <strong>Starting Bid:</strong> ${auction.startingBid}
                          {auction.currentBid && (
                            <span className="ml-4">
                              <strong>Current Bid:</strong> ${auction.currentBid}
                            </span>
                          )}
                        </div>
                        {auction.winnerId && (
                          <div className="text-sm text-green-600">
                            <strong>Winner:</strong> {auction.winnerId.username}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        {auction.auctionStatus === 'active' ? (
                          <div className="text-blue-600">
                            ⏰ {getTimeRemaining(auction.endTime)}
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            Ended {new Date(auction.endTime).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Bids Tab */}
        {activeTab === 'bidding' && (
          <div>
            {myBids.length === 0 ? (
              <p className="text-center text-gray-500 py-10">
                You haven't placed any bids yet.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {myBids.map((bid) => {
                  const bidStatus = getBidStatus(bid);
                  return (
                    <div key={bid._id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2.5">
                        <div>
                          <h4 className="m-0 mb-1.5 text-gray-700">
                            {formatNFTDescription(bid.auctionId.nftId)}
                          </h4>
                          <div className="text-xs text-gray-500 mb-1.5">
                            <span style={{ color: getRarityColor(bid.auctionId.nftId.colorRarity) }}>
                              Color: {bid.auctionId.nftId.colorRarity}
                            </span>
                            {bid.auctionId.nftId.propRarity !== 'notPresent' && (
                              <>
                                {' • '}
                                <span style={{ color: getRarityColor(bid.auctionId.nftId.propRarity) }}>
                                  Props: {bid.auctionId.nftId.propRarity}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <span 
                          className="text-white px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: bidStatus.color }}
                        >
                          {bidStatus.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-base font-bold text-blue-600 mb-1.5">
                            Your Bid: ${bid.bidAmount}
                            {bid.isAutobid && <span className="text-xs ml-2">(Auto)</span>}
                          </div>
                          <div className="text-xs text-gray-500">
                            Placed: {new Date(bid.bidTime).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          {bid.auctionId.auctionStatus === 'active' ? (
                            <div className="text-blue-600">
                              ⏰ {getTimeRemaining(bid.auctionId.endTime)}
                            </div>
                          ) : (
                            <div className="text-gray-500">
                              Ended {new Date(bid.auctionId.endTime).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAuctions;
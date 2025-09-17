import React, { useState, useEffect } from 'react';

interface NFT {
  _id: string;
  displayName: string;
  collectionName: string;
  color: string;
  thing: string;
  colorRarity: string;
  propRarity: string;
  props: Array<{ name: string; rarity: string }>;
  isFirstOfSet?: boolean;
}

interface Auction {
  _id: string;
  nftId: NFT;
  auctionType: 'standard' | 'dutch' | 'reserve';
  auctionStatus: 'active' | 'ended' | 'cancelled';
  startingBid: number;
  currentBid?: number;
  reservePrice?: number;
  endTime: string;
  winnerId?: {
    _id: string;
    username: string;
  };
}

interface Bid {
  _id: string;
  auctionId: {
    _id: string;
    nftId: NFT;
    auctionStatus: 'active' | 'ended' | 'cancelled';
    endTime: string;
    winnerId?: {
      _id: string;
      username: string;
    };
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
  const [myAuctions, setMyAuctions] = useState<Auction[]>([]);
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

  const formatNFTDescription = (nft: NFT) => {
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
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          Loading auction data...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>My Auction Activity</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6c757d'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{ color: '#dc3545', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #e9ecef' }}>
            <button
              onClick={() => setActiveTab('selling')}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'selling' ? '2px solid #007bff' : 'none',
                color: activeTab === 'selling' ? '#007bff' : '#6c757d',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === 'selling' ? 'bold' : 'normal'
              }}
            >
              🏪 My Auctions ({myAuctions.length})
            </button>
            <button
              onClick={() => setActiveTab('bidding')}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'bidding' ? '2px solid #007bff' : 'none',
                color: activeTab === 'bidding' ? '#007bff' : '#6c757d',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === 'bidding' ? 'bold' : 'normal'
              }}
            >
              🎯 My Bids ({myBids.length})
            </button>
          </div>
        </div>

        {/* My Auctions Tab */}
        {activeTab === 'selling' && (
          <div>
            {myAuctions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6c757d', padding: '40px' }}>
                You haven't created any auctions yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {myAuctions.map((auction) => (
                  <div key={auction._id} style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#495057' }}>
                          {getAuctionTypeIcon(auction.auctionType)} {formatNFTDescription(auction.nftId)}
                        </h4>
                        <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
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
                      <span style={{
                        backgroundColor: auction.auctionStatus === 'active' ? '#28a745' : 
                                       auction.auctionStatus === 'ended' ? '#007bff' : '#6c757d',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {auction.auctionStatus.toUpperCase()}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                          <strong>Starting Bid:</strong> ${auction.startingBid}
                          {auction.currentBid && (
                            <span style={{ marginLeft: '15px' }}>
                              <strong>Current Bid:</strong> ${auction.currentBid}
                            </span>
                          )}
                        </div>
                        {auction.winnerId && (
                          <div style={{ fontSize: '14px', color: '#28a745' }}>
                            <strong>Winner:</strong> {auction.winnerId.username}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '14px' }}>
                        {auction.auctionStatus === 'active' ? (
                          <div style={{ color: '#007bff' }}>
                            ⏰ {getTimeRemaining(auction.endTime)}
                          </div>
                        ) : (
                          <div style={{ color: '#6c757d' }}>
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
              <p style={{ textAlign: 'center', color: '#6c757d', padding: '40px' }}>
                You haven't placed any bids yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {myBids.map((bid) => {
                  const bidStatus = getBidStatus(bid);
                  return (
                    <div key={bid._id} style={{
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#495057' }}>
                            {formatNFTDescription(bid.auctionId.nftId)}
                          </h4>
                          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
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
                        <span style={{
                          backgroundColor: bidStatus.color,
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {bidStatus.status}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#007bff', marginBottom: '5px' }}>
                            Your Bid: ${bid.bidAmount}
                            {bid.isAutobid && <span style={{ fontSize: '12px', marginLeft: '8px' }}>(Auto)</span>}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>
                            Placed: {new Date(bid.bidTime).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '14px' }}>
                          {bid.auctionId.auctionStatus === 'active' ? (
                            <div style={{ color: '#007bff' }}>
                              ⏰ {getTimeRemaining(bid.auctionId.endTime)}
                            </div>
                          ) : (
                            <div style={{ color: '#6c757d' }}>
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
import React, { useState } from 'react';

interface NFT {
  _id: string;
  collectionName: string;
  displayName: string;
  color: string;
  thing: string;
  colorRarity: string;
  propRarity: string;
  props: Array<{ name: string; rarity: string }>;
  currentPrice: number;
  marketStatus: string;
  isFirstOfSet?: boolean;
}

interface CreateListingProps {
  userNFTs: NFT[];
  onCreateListing: (nftId: string, listingType: 'fixed' | 'auction', data: any) => void;
  onClose: () => void;
}

const CreateListing: React.FC<CreateListingProps> = ({ userNFTs, onCreateListing, onClose }) => {
  const [selectedNFT, setSelectedNFT] = useState<string>('');
  const [listingType, setListingType] = useState<'fixed' | 'auction'>('fixed');
  
  // Fixed price listing fields
  const [fixedPrice, setFixedPrice] = useState<number>(0);
  
  // Auction fields
  const [auctionType, setAuctionType] = useState<'standard' | 'dutch' | 'reserve'>('standard');
  const [startingBid, setStartingBid] = useState<number>(0);
  const [duration, setDuration] = useState<number>(300); // 5 minutes default
  const [reservePrice, setReservePrice] = useState<number>(0);

  const availableNFTs = userNFTs.filter(nft => nft.marketStatus === 'Owned');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedNFT) {
      alert('Please select an NFT to list');
      return;
    }

    if (listingType === 'fixed') {
      if (fixedPrice <= 0) {
        alert('Please enter a valid price');
        return;
      }
      onCreateListing(selectedNFT, 'fixed', { price: fixedPrice });
    } else {
      if (startingBid <= 0) {
        alert('Please enter a valid starting bid');
        return;
      }
      
      const auctionData: any = {
        auctionType,
        startingBid,
        duration
      };
      
      if (auctionType === 'reserve' && reservePrice > 0) {
        auctionData.reservePrice = reservePrice;
      }
      
      onCreateListing(selectedNFT, 'auction', auctionData);
    }
  };

  const getDurationDisplay = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const formatNFTDescription = (nft: NFT) => {
    let description = '';
    
    // Add FIRST OF SET indicator
    if (nft.isFirstOfSet) {
      description += '**FIRST OF SET** ';
    }
    
    // Add color
    description += nft.color;
    
    // Add thing/item
    description += ` ${nft.thing}`;
    
    // Add props if any
    if (nft.props && nft.props.length > 0) {
      const propDescriptions = nft.props.map(prop => prop.name).join(', ');
      description += ` with ${propDescriptions}`;
    }
    
    return description;
  };

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
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Create New Listing</h2>
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

        <form onSubmit={handleSubmit}>
          {/* NFT Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Select NFT to List:
            </label>
            <select
              value={selectedNFT}
              onChange={(e) => setSelectedNFT(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
              required
            >
              <option value="">Choose an NFT...</option>
              {availableNFTs.map(nft => (
                <option key={nft._id} value={nft._id}>
                  {formatNFTDescription(nft)} - {nft.collectionName}
                </option>
              ))}
            </select>
            {availableNFTs.length === 0 && (
              <p style={{ color: '#6c757d', fontSize: '14px', margin: '5px 0' }}>
                No NFTs available to list. You need to own NFTs to create listings.
              </p>
            )}
          </div>

          {/* Listing Type Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Listing Type:
            </label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="fixed"
                  checked={listingType === 'fixed'}
                  onChange={(e) => setListingType(e.target.value as 'fixed' | 'auction')}
                  style={{ marginRight: '8px' }}
                />
                🏷️ Fixed Price Sale
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="auction"
                  checked={listingType === 'auction'}
                  onChange={(e) => setListingType(e.target.value as 'fixed' | 'auction')}
                  style={{ marginRight: '8px' }}
                />
                🔨 Auction
              </label>
            </div>
          </div>

          {/* Fixed Price Fields */}
          {listingType === 'fixed' && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 15px 0' }}>Fixed Price Sale</h4>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Sale Price ($):
                </label>
                <input
                  type="number"
                  value={fixedPrice || ''}
                  onChange={(e) => setFixedPrice(Number(e.target.value))}
                  min="1"
                  step="1"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                  placeholder="Enter sale price"
                  required
                />
                <p style={{ fontSize: '12px', color: '#6c757d', margin: '5px 0' }}>
                  Buyers can purchase immediately at this price
                </p>
              </div>
            </div>
          )}

          {/* Auction Fields */}
          {listingType === 'auction' && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 15px 0' }}>Auction Settings</h4>
              
              {/* Auction Type */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Auction Type:
                </label>
                <select
                  value={auctionType}
                  onChange={(e) => setAuctionType(e.target.value as 'standard' | 'dutch' | 'reserve')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="standard">🔨 Standard Auction (bids increase)</option>
                  <option value="dutch">⚡ Dutch Auction (price decreases)</option>
                  <option value="reserve">💎 Reserve Auction (hidden minimum)</option>
                </select>
              </div>

              {/* Starting Bid */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  {auctionType === 'dutch' ? 'Starting Price ($):' : 'Starting Bid ($):'}
                </label>
                <input
                  type="number"
                  value={startingBid || ''}
                  onChange={(e) => setStartingBid(Number(e.target.value))}
                  min="1"
                  step="1"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                  placeholder={auctionType === 'dutch' ? 'Enter starting price' : 'Enter minimum bid'}
                  required
                />
              </div>

              {/* Duration */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Duration: {getDurationDisplay(duration)}
                </label>
                <input
                  type="range"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="60"
                  max="3600"
                  step="60"
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6c757d' }}>
                  <span>1m</span>
                  <span>30m</span>
                  <span>1h</span>
                </div>
              </div>

              {/* Reserve Price (only for reserve auctions) */}
              {auctionType === 'reserve' && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Reserve Price ($) - Optional:
                  </label>
                  <input
                    type="number"
                    value={reservePrice || ''}
                    onChange={(e) => setReservePrice(Number(e.target.value))}
                    min="0"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    placeholder="Hidden minimum price (optional)"
                  />
                  <p style={{ fontSize: '12px', color: '#6c757d', margin: '5px 0' }}>
                    Auction won't sell below this price (hidden from bidders)
                  </p>
                </div>
              )}

              {/* Auction Type Descriptions */}
              <div style={{ fontSize: '12px', color: '#6c757d', backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
                {auctionType === 'standard' && (
                  <p style={{ margin: 0 }}>
                    <strong>Standard Auction:</strong> Bidders compete by placing higher bids. Highest bid wins when time expires.
                  </p>
                )}
                {auctionType === 'dutch' && (
                  <p style={{ margin: 0 }}>
                    <strong>Dutch Auction:</strong> Price starts high and decreases over time. First bidder at current price wins.
                  </p>
                )}
                {auctionType === 'reserve' && (
                  <p style={{ margin: 0 }}>
                    <strong>Reserve Auction:</strong> Like standard auction, but won't sell below your hidden reserve price.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #6c757d',
                backgroundColor: 'white',
                color: '#6c757d',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={availableNFTs.length === 0}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: availableNFTs.length === 0 ? '#6c757d' : '#007bff',
                color: 'white',
                borderRadius: '4px',
                cursor: availableNFTs.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {listingType === 'fixed' ? 'List for Sale' : 'Start Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
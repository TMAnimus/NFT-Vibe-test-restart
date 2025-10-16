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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
      <div className="bg-white p-8 rounded-lg w-[90%] max-w-[500px] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="m-0 text-2xl font-bold">Create New Listing</h2>
          <button 
            onClick={onClose}
            className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* NFT Selection */}
          <div className="mb-5">
            <label className="block mb-2 font-bold">
              Select NFT to List:
            </label>
            <select
              value={selectedNFT}
              onChange={(e) => setSelectedNFT(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
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
              <p className="text-gray-500 text-sm my-1.5">
                No NFTs available to list. You need to own NFTs to create listings.
              </p>
            )}
          </div>

          {/* Listing Type Selection */}
          <div className="mb-5">
            <label className="block mb-2 font-bold">
              Listing Type:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="fixed"
                  checked={listingType === 'fixed'}
                  onChange={(e) => setListingType(e.target.value as 'fixed' | 'auction')}
                  className="mr-2"
                />
                🏷️ Fixed Price Sale
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="auction"
                  checked={listingType === 'auction'}
                  onChange={(e) => setListingType(e.target.value as 'fixed' | 'auction')}
                  className="mr-2"
                />
                🔨 Auction
              </label>
            </div>
          </div>

          {/* Fixed Price Fields */}
          {listingType === 'fixed' && (
            <div className="mb-5 p-4 bg-gray-50 rounded">
              <h4 className="m-0 mb-4 text-lg font-semibold">Fixed Price Sale</h4>
              <div>
                <label className="block mb-2 font-bold">
                  Sale Price ($):
                </label>
                <input
                  type="number"
                  value={fixedPrice || ''}
                  onChange={(e) => setFixedPrice(Number(e.target.value))}
                  min="1"
                  step="1"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter sale price"
                  required
                />
                <p className="text-xs text-gray-500 my-1.5">
                  Buyers can purchase immediately at this price
                </p>
              </div>
            </div>
          )}

          {/* Auction Fields */}
          {listingType === 'auction' && (
            <div className="mb-5 p-4 bg-blue-50 rounded">
              <h4 className="m-0 mb-4 text-lg font-semibold">Auction Settings</h4>
              
              {/* Auction Type */}
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  Auction Type:
                </label>
                <select
                  value={auctionType}
                  onChange={(e) => setAuctionType(e.target.value as 'standard' | 'dutch' | 'reserve')}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="standard">🔨 Standard Auction (bids increase)</option>
                  <option value="dutch">⚡ Dutch Auction (price decreases)</option>
                  <option value="reserve">💎 Reserve Auction (hidden minimum)</option>
                </select>
              </div>

              {/* Starting Bid */}
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  {auctionType === 'dutch' ? 'Starting Price ($):' : 'Starting Bid ($):'}
                </label>
                <input
                  type="number"
                  value={startingBid || ''}
                  onChange={(e) => setStartingBid(Number(e.target.value))}
                  min="1"
                  step="1"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder={auctionType === 'dutch' ? 'Enter starting price' : 'Enter minimum bid'}
                  required
                />
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  Duration: {getDurationDisplay(duration)}
                </label>
                <input
                  type="range"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="60"
                  max="3600"
                  step="60"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1m</span>
                  <span>30m</span>
                  <span>1h</span>
                </div>
              </div>

              {/* Reserve Price (only for reserve auctions) */}
              {auctionType === 'reserve' && (
                <div className="mb-4">
                  <label className="block mb-2 font-bold">
                    Reserve Price ($) - Optional:
                  </label>
                  <input
                    type="number"
                    value={reservePrice || ''}
                    onChange={(e) => setReservePrice(Number(e.target.value))}
                    min="0"
                    step="1"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Hidden minimum price (optional)"
                  />
                  <p className="text-xs text-gray-500 my-1.5">
                    Auction won't sell below this price (hidden from bidders)
                  </p>
                </div>
              )}

              {/* Auction Type Descriptions */}
              <div className="text-xs text-gray-500 bg-white p-2.5 rounded">
                {auctionType === 'standard' && (
                  <p className="m-0">
                    <strong>Standard Auction:</strong> Bidders compete by placing higher bids. Highest bid wins when time expires.
                  </p>
                )}
                {auctionType === 'dutch' && (
                  <p className="m-0">
                    <strong>Dutch Auction:</strong> Price starts high and decreases over time. First bidder at current price wins.
                  </p>
                )}
                {auctionType === 'reserve' && (
                  <p className="m-0">
                    <strong>Reserve Auction:</strong> Like standard auction, but won't sell below your hidden reserve price.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-500 bg-white text-gray-500 rounded cursor-pointer hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={availableNFTs.length === 0}
              className={`px-5 py-2.5 border-none text-white rounded ${
                availableNFTs.length === 0 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 cursor-pointer hover:bg-blue-700'
              }`}
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
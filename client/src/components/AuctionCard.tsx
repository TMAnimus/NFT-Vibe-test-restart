import { useState, useEffect } from 'react';

interface Auction {
    _id: string;
    id: string;
    nftId: {
        _id: string;
        collectionName: string;
        displayName: string;
        color: string;
        thing: string;
        colorRarity: string;
        propRarity: string;
        props: Array<{ name: string; rarity: string }>;
        currentPrice: number;
        isFirstOfSet?: boolean;
    };
    sellerId: {
        _id: string;
        username: string;
    };
    auctionType: 'standard' | 'dutch' | 'reserve';
    auctionStatus: 'active' | 'ended' | 'cancelled';
    startingBid: number;
    currentBid?: number;
    reservePrice?: number;
    dutchCurrentPrice?: number;
    endTime: string;
    winnerId?: {
        _id: string;
        username: string;
    };
}

interface AuctionCardProps {
    auction: Auction;
    onBid: (auctionId: string, bidAmount: number) => void;
    currentUserId?: string;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction, onBid, currentUserId }) => {
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [showBidForm, setShowBidForm] = useState<boolean>(false);

    useEffect(() => {
        const updateTimeRemaining = () => {
            const now = new Date().getTime();
            const endTime = new Date(auction.endTime).getTime();
            const difference = endTime - now;

            if (difference > 0) {
                const hours = Math.floor(difference / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeRemaining('Ended');
            }
        };

        updateTimeRemaining();
        const interval = setInterval(updateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [auction.endTime]);

    const getDisplayPrice = () => {
        if (auction.auctionType === 'dutch' && auction.dutchCurrentPrice) {
            return auction.dutchCurrentPrice;
        }
        return auction.currentBid || auction.startingBid;
    };

    const getMinimumBid = () => {
        const currentPrice = getDisplayPrice();
        return auction.auctionType === 'dutch' ? currentPrice : currentPrice + 1;
    };

    const handleBidSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (bidAmount >= getMinimumBid()) {
            onBid(auction._id, bidAmount);
            setShowBidForm(false);
            setBidAmount(0);
        }
    };

    const getAuctionTypeDisplay = () => {
        switch (auction.auctionType) {
            case 'standard':
                return '🔨 Standard Auction';
            case 'dutch':
                return '⚡ Dutch Auction';
            case 'reserve':
                return '💎 Reserve Auction';
            default:
                return '🔨 Auction';
        }
    };

    const getRarityClass = (rarity: string) => {
        const classes = {
            'common': 'rarity-common',
            'uncommon': 'rarity-uncommon',
            'rare': 'rarity-rare',
            'veryRare': 'rarity-very-rare',
            'notPresent': 'rarity-common'
        };
        return classes[rarity as keyof typeof classes] || 'rarity-common';
    };

    const formatNFTDescription = () => {
        const { isFirstOfSet, color, thing, props } = auction.nftId;

        let description = '';

        // Add FIRST OF SET indicator
        if (isFirstOfSet) {
            description += '**FIRST OF SET** ';
        }

        // Add color with rarity styling
        description += color;

        // Add thing/item
        description += ` ${thing}`;

        // Add props if any
        if (props && props.length > 0) {
            const propDescriptions = props.map(prop => prop.name).join(', ');
            description += ` with ${propDescriptions}`;
        }

        return description;
    };

    const isUserSeller = currentUserId === auction.sellerId._id;
    const canBid = auction.auctionStatus === 'active' && !isUserSeller && timeRemaining !== 'Ended';

    return (
        <div className="card-auction">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 mr-3">
                    <h3 className="text-blue-600 text-base font-semibold leading-tight mb-1">
                        {formatNFTDescription()}
                    </h3>
                    <div className="text-xs text-gray-500 mb-1">
                        <span className={getRarityClass(auction.nftId.colorRarity)}>
                            Color: {auction.nftId.colorRarity}
                        </span>
                        {auction.nftId.propRarity !== 'notPresent' && (
                            <>
                                {' • '}
                                <span className={getRarityClass(auction.nftId.propRarity)}>
                                    Props: {auction.nftId.propRarity}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap ${
                    auction.auctionStatus === 'active' ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                    {auction.auctionStatus.toUpperCase()}
                </span>
            </div>

            <div className="mb-3 space-y-1">
                <p className="text-sm font-semibold text-gray-800">
                    {getAuctionTypeDisplay()}
                </p>
                <p className="text-sm text-gray-600">
                    <span className="font-medium">Seller:</span> {auction.sellerId.username}
                </p>
                <p className="text-sm text-gray-600">
                    <span className="font-medium">Collection:</span> {auction.nftId.collectionName}
                </p>
            </div>

            <div className="bg-white p-3 rounded border mb-3">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">Current Price:</span>
                    <span className="text-lg font-bold text-green-600">
                        ${getDisplayPrice()}
                    </span>
                </div>

                {auction.auctionType === 'reserve' && (
                    <div className="text-xs text-gray-500">
                        Reserve price: {auction.reservePrice && auction.currentBid && auction.currentBid >= auction.reservePrice ? 'Met' : 'Not met'}
                    </div>
                )}

                {auction.winnerId && (
                    <div className="text-xs text-blue-600">
                        <span className="font-medium">Current Winner:</span> {auction.winnerId.username}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-800">
                    ⏰ {timeRemaining}
                </span>
                {auction.auctionType === 'dutch' && (
                    <span className="text-xs text-red-600 font-medium">
                        Price decreasing...
                    </span>
                )}
            </div>

            {canBid && (
                <div>
                    {!showBidForm ? (
                        <button
                            onClick={() => setShowBidForm(true)}
                            className="btn-primary w-full"
                        >
                            Place Bid (Min: ${getMinimumBid()})
                        </button>
                    ) : (
                        <form onSubmit={handleBidSubmit} className="flex gap-2">
                            <input
                                type="number"
                                value={bidAmount || ''}
                                onChange={(e) => setBidAmount(Number(e.target.value))}
                                placeholder={`Min: $${getMinimumBid()}`}
                                min={getMinimumBid()}
                                className="input-field flex-1"
                                required
                            />
                            <button
                                type="submit"
                                className="btn-success px-3"
                            >
                                Bid
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowBidForm(false);
                                    setBidAmount(0);
                                }}
                                className="btn-secondary px-3"
                            >
                                Cancel
                            </button>
                        </form>
                    )}
                </div>
            )}

            {isUserSeller && (
                <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                    📝 This is your auction
                </div>
            )}
        </div>
    );
};

export default AuctionCard;
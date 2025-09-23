import React, { useState, useEffect } from 'react';

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

    const formatNFTDescription = () => {
        const { displayName, isFirstOfSet, color, thing, colorRarity, propRarity, props } = auction.nftId;

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
        <div style={{
            border: '2px solid #007bff',
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            marginBottom: '15px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ flex: 1, marginRight: '10px' }}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#007bff', fontSize: '16px', lineHeight: '1.3' }}>
                        {formatNFTDescription()}
                    </h3>
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
                    backgroundColor: auction.auctionStatus === 'active' ? '#28a745' : '#6c757d',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap'
                }}>
                    {auction.auctionStatus.toUpperCase()}
                </span>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>{getAuctionTypeDisplay()}</strong>
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Seller:</strong> {auction.sellerId.username}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Collection:</strong> {auction.nftId.collectionName}
                </p>
            </div>

            <div style={{
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '10px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span><strong>Current Price:</strong></span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                        ${getDisplayPrice()}
                    </span>
                </div>

                {auction.auctionType === 'reserve' && (
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        Reserve price: {auction.reservePrice && auction.currentBid && auction.currentBid >= auction.reservePrice ? 'Met' : 'Not met'}
                    </div>
                )}

                {auction.winnerId && (
                    <div style={{ fontSize: '12px', color: '#007bff' }}>
                        <strong>Current Winner:</strong> {auction.winnerId.username}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    ⏰ {timeRemaining}
                </span>
                {auction.auctionType === 'dutch' && (
                    <span style={{ fontSize: '12px', color: '#dc3545' }}>
                        Price decreasing...
                    </span>
                )}
            </div>

            {canBid && (
                <div>
                    {!showBidForm ? (
                        <button
                            onClick={() => setShowBidForm(true)}
                            style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Place Bid (Min: ${getMinimumBid()})
                        </button>
                    ) : (
                        <form onSubmit={handleBidSubmit} style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="number"
                                value={bidAmount || ''}
                                onChange={(e) => setBidAmount(Number(e.target.value))}
                                placeholder={`Min: $${getMinimumBid()}`}
                                min={getMinimumBid()}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                                required
                            />
                            <button
                                type="submit"
                                style={{
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Bid
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowBidForm(false);
                                    setBidAmount(0);
                                }}
                                style={{
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </form>
                    )}
                </div>
            )}

            {isUserSeller && (
                <div style={{
                    marginTop: '10px',
                    padding: '8px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '4px',
                    fontSize: '12px'
                }}>
                    📝 This is your auction
                </div>
            )}
        </div>
    );
};

export default AuctionCard;
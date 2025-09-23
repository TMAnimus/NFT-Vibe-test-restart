import React, { useEffect, useState } from 'react';
import { 
    getListedNFTs, 
    getActiveAuctions, 
    getUserNFTs, 
    createFixedPriceListing, 
    createAuction, 
    placeBid, 
    buyNFT,
    getUserProfile
} from '../services/api';
import { io } from 'socket.io-client';
import AuctionCard from './AuctionCard';
import CreateListing from './CreateListing';
import MyAuctions from './MyAuctions';
import GenerateNFT from './GenerateNFT';

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
    ownerId?: {
        _id: string;
        username: string;
    };
}

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

const Marketplace = () => {
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'fixed' | 'auctions'>('fixed');
    const [showCreateListing, setShowCreateListing] = useState<boolean>(false);
    const [showMyAuctions, setShowMyAuctions] = useState<boolean>(false);
    const [showGenerateNFT, setShowGenerateNFT] = useState<boolean>(false);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [listedNfts, activeAuctions, myNFTs, profile] = await Promise.all([
                    getListedNFTs(),
                    getActiveAuctions(),
                    getUserNFTs(),
                    getUserProfile()
                ]);
                
                setNfts(listedNfts);
                setAuctions(activeAuctions);
                setUserNFTs(myNFTs);
                setUserProfile(profile);
                
                // Extract user ID from JWT token (simple decode)
                const token = localStorage.getItem('jwt_token');
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        setCurrentUserId(payload.userId);
                    } catch (e) {
                        console.error('Error decoding token:', e);
                    }
                }
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchData();

        // Setup Socket.IO
        const socket = io('http://localhost:3000', {
            auth: {
                token: localStorage.getItem('jwt_token'),
            },
        });

        socket.on('connect', () => {
            console.log('Connected to Socket.IO');
        });

        // Fixed-price listing events
        socket.on('listingCreated', (data: { nft: NFT }) => {
            console.log('New listing created:', data.nft);
            setNfts((prevNfts) => [data.nft, ...prevNfts]);
        });

        socket.on('listingSold', (data: { nft: NFT, buyer: string }) => {
            console.log('NFT sold:', data);
            setNfts((prevNfts) => prevNfts.filter(nft => nft._id !== data.nft._id));
        });

        // Auction events
        socket.on('auctionCreated', (data: { auction: Auction }) => {
            console.log('New auction created:', data.auction);
            setAuctions((prevAuctions) => [data.auction, ...prevAuctions]);
        });

        socket.on('bidPlaced', (data: { auction: Auction, bid: any }) => {
            console.log('Bid placed:', data);
            setAuctions((prevAuctions) => 
                prevAuctions.map(auction => 
                    auction._id === data.auction._id ? data.auction : auction
                )
            );
        });

        socket.on('auctionEnded', (data: { auction: Auction, winner?: string }) => {
            console.log('Auction ended:', data);
            setAuctions((prevAuctions) => 
                prevAuctions.filter(auction => auction._id !== data.auction._id)
            );
        });

        socket.on('auctionUpdated', (data: { auction: Auction }) => {
            console.log('Auction updated:', data.auction);
            setAuctions((prevAuctions) => 
                prevAuctions.map(auction => 
                    auction._id === data.auction._id ? data.auction : auction
                )
            );
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO');
        });

        socket.on('connect_error', (err) => {
            console.error('Socket.IO connection error:', err.message);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleBuy = async (nftId: string) => {
        try {
            await buyNFT(nftId);
            // Remove from listings
            setNfts(prevNfts => prevNfts.filter(nft => nft._id !== nftId));
            // Refresh user NFTs
            const updatedUserNFTs = await getUserNFTs();
            setUserNFTs(updatedUserNFTs);
        } catch (err: any) {
            alert(`Error buying NFT: ${err.message}`);
        }
    };

    const handleBid = async (auctionId: string, bidAmount: number) => {
        try {
            await placeBid(auctionId, bidAmount);
            // Real-time update will come via socket
        } catch (err: any) {
            alert(`Error placing bid: ${err.message}`);
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

    const formatNFTDescription = (nft: NFT) => {
        let description = '';
        
        // Add FIRST OF SET indicator
        if (nft.isFirstOfSet) {
            description += '**FIRST OF SET** ';
        }
        
        // Add color with rarity styling
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

    const handleCreateListing = async (nftId: string, listingType: 'fixed' | 'auction', data: any) => {
        try {
            if (listingType === 'fixed') {
                await createFixedPriceListing(nftId, data.price);
            } else {
                await createAuction(nftId, data);
            }
            
            // Refresh data
            await refreshData();
            setShowCreateListing(false);
        } catch (err: any) {
            alert(`Error creating listing: ${err.message}`);
        }
    };

    const refreshData = async () => {
        try {
            const [listedNfts, activeAuctions, myNFTs, profile] = await Promise.all([
                getListedNFTs(),
                getActiveAuctions(),
                getUserNFTs(),
                getUserProfile()
            ]);
            
            setNfts(listedNfts);
            setAuctions(activeAuctions);
            setUserNFTs(myNFTs);
            setUserProfile(profile);
        } catch (err: any) {
            console.error('Error refreshing data:', err);
        }
    };

    const handleNFTGenerated = async () => {
        await refreshData();
    };

    return (
        <div style={{ padding: '20px' }}>
            {/* Header with user info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: '0 0 5px 0' }}>NFT Marketplace</h1>
                    {userProfile && (
                        <div style={{ fontSize: '14px', color: '#6c757d' }}>
                            Welcome, <strong>{userProfile.username}</strong> • Balance: <strong style={{ color: '#28a745' }}>${userProfile.balance}</strong> • NFTs: <strong>{userProfile.nfts?.length || 0}</strong>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setShowGenerateNFT(true)}
                        style={{
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        🎲 Generate NFT
                    </button>
                    <button
                        onClick={() => setShowMyAuctions(true)}
                        style={{
                            backgroundColor: '#6f42c1',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        📊 My Activity
                    </button>
                    <button
                        onClick={() => setShowCreateListing(true)}
                        style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        + Create Listing
                    </button>
                </div>
            </div>

            {error && <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}

            {/* Tab Navigation */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', borderBottom: '2px solid #e9ecef' }}>
                    <button
                        onClick={() => setActiveTab('fixed')}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            borderBottom: activeTab === 'fixed' ? '2px solid #007bff' : 'none',
                            color: activeTab === 'fixed' ? '#007bff' : '#6c757d',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: activeTab === 'fixed' ? 'bold' : 'normal'
                        }}
                    >
                        🏷️ Fixed Price ({nfts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('auctions')}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            borderBottom: activeTab === 'auctions' ? '2px solid #007bff' : 'none',
                            color: activeTab === 'auctions' ? '#007bff' : '#6c757d',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: activeTab === 'auctions' ? 'bold' : 'normal'
                        }}
                    >
                        🔨 Auctions ({auctions.length})
                    </button>
                </div>
            </div>

            {/* Fixed Price Listings */}
            {activeTab === 'fixed' && (
                <div>
                    <h2 style={{ marginBottom: '15px' }}>Fixed Price Listings</h2>
                    {nfts.length === 0 ? (
                        <p style={{ color: '#6c757d', textAlign: 'center', padding: '40px' }}>
                            No fixed-price listings available
                        </p>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                            gap: '20px' 
                        }}>
                            {nfts.map((nft) => (
                                <div key={nft._id} style={{ 
                                    border: '1px solid #dee2e6', 
                                    padding: '15px', 
                                    borderRadius: '8px',
                                    backgroundColor: 'white'
                                }}>
                                    <h3 style={{ margin: '0 0 8px 0', color: '#495057', fontSize: '16px', lineHeight: '1.3' }}>
                                        {formatNFTDescription(nft)}
                                    </h3>
                                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>
                                        <span style={{ color: getRarityColor(nft.colorRarity) }}>
                                            Color: {nft.colorRarity}
                                        </span>
                                        {nft.propRarity !== 'notPresent' && (
                                            <>
                                                {' • '}
                                                <span style={{ color: getRarityColor(nft.propRarity) }}>
                                                    Props: {nft.propRarity}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#6c757d' }}>
                                        <strong>Collection:</strong> {nft.collectionName}
                                    </p>
                                    {nft.ownerId && (
                                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#6c757d' }}>
                                            <strong>Seller:</strong> {nft.ownerId.username}
                                        </p>
                                    )}
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        marginTop: '15px'
                                    }}>
                                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                                            ${nft.currentPrice}
                                        </span>
                                        <button 
                                            onClick={() => handleBuy(nft._id)}
                                            disabled={nft.ownerId?._id === currentUserId}
                                            style={{
                                                backgroundColor: nft.ownerId?._id === currentUserId ? '#6c757d' : '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '4px',
                                                cursor: nft.ownerId?._id === currentUserId ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {nft.ownerId?._id === currentUserId ? 'Your NFT' : 'Buy Now'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Auctions */}
            {activeTab === 'auctions' && (
                <div>
                    <h2 style={{ marginBottom: '15px' }}>Active Auctions</h2>
                    {auctions.length === 0 ? (
                        <p style={{ color: '#6c757d', textAlign: 'center', padding: '40px' }}>
                            No active auctions available
                        </p>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                            gap: '20px' 
                        }}>
                            {auctions.map((auction) => (
                                <AuctionCard
                                    key={auction._id}
                                    auction={auction}
                                    onBid={handleBid}
                                    currentUserId={currentUserId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create Listing Modal */}
            {showCreateListing && (
                <CreateListing
                    userNFTs={userNFTs}
                    onCreateListing={handleCreateListing}
                    onClose={() => setShowCreateListing(false)}
                />
            )}

            {/* My Auctions Modal */}
            {showMyAuctions && (
                <MyAuctions
                    onClose={() => setShowMyAuctions(false)}
                />
            )}

            {/* Generate NFT Modal */}
            {showGenerateNFT && (
                <GenerateNFT
                    onClose={() => setShowGenerateNFT(false)}
                    onNFTGenerated={handleNFTGenerated}
                />
            )}
        </div>
    );
};

export default Marketplace;

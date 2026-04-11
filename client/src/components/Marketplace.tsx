import { useEffect, useState } from 'react';
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
import type { NFT, Auction } from '../types';

const RARITY_COLORS: Record<string, string> = {
    common: '#6c757d',
    uncommon: '#28a745',
    rare: '#007bff',
    veryRare: '#6f42c1',
    notPresent: '#6c757d',
};

const MARKET_STATUS_BADGE: Record<string, string> = {
    Owned: 'bg-gray-400',
    Listed: 'bg-blue-500',
    Auction: 'bg-purple-600',
    Sold: 'bg-green-600',
};

const Marketplace = () => {
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'fixed' | 'auctions'>('fixed');
    const [showCreateListing, setShowCreateListing] = useState(false);
    const [showMyAuctions, setShowMyAuctions] = useState(false);
    const [showGenerateNFT, setShowGenerateNFT] = useState(false);
    const [currentUserId, setCurrentUserId] = useState('');
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

        const socket = io('http://localhost:3000', {
            auth: { token: localStorage.getItem('jwt_token') },
        });

        socket.on('listingCreated', (data: { nft: NFT }) => {
            setNfts(prev => [data.nft, ...prev]);
        });

        socket.on('listingSold', (data: { nft: NFT }) => {
            setNfts(prev => prev.filter(n => n._id !== data.nft._id));
        });

        socket.on('auctionCreated', (data: { auction: Auction }) => {
            setAuctions(prev => [data.auction, ...prev]);
        });

        socket.on('bidPlaced', (data: { auction: Auction }) => {
            setAuctions(prev => prev.map(a => a._id === data.auction._id ? data.auction : a));
        });

        socket.on('auctionEnded', (data: { auction: Auction }) => {
            setAuctions(prev => prev.filter(a => a._id !== data.auction._id));
        });

        socket.on('auctionUpdated', (data: { auction: Auction }) => {
            setAuctions(prev => prev.map(a => a._id === data.auction._id ? data.auction : a));
        });

        socket.on('connect_error', (err) => {
            console.error('Socket.IO connection error:', err.message);
        });

        return () => { socket.disconnect(); };
    }, []);

    const refreshData = async () => {
        try {
            const [listedNfts, activeAuctions, myNFTs, profile] = await Promise.all([
                getListedNFTs(), getActiveAuctions(), getUserNFTs(), getUserProfile()
            ]);
            setNfts(listedNfts);
            setAuctions(activeAuctions);
            setUserNFTs(myNFTs);
            setUserProfile(profile);
        } catch (err: any) {
            console.error('Error refreshing data:', err);
        }
    };

    const handleBuy = async (nftId: string) => {
        try {
            await buyNFT(nftId);
            setNfts(prev => prev.filter(n => n._id !== nftId));
            setUserNFTs(await getUserNFTs());
        } catch (err: any) {
            alert(`Error buying NFT: ${err.message}`);
        }
    };

    const handleBid = async (auctionId: string, bidAmount: number) => {
        try {
            await placeBid(auctionId, bidAmount);
        } catch (err: any) {
            alert(`Error placing bid: ${err.message}`);
        }
    };

    const handleCreateListing = async (nftId: string, listingType: 'fixed' | 'auction', data: any) => {
        try {
            if (listingType === 'fixed') {
                await createFixedPriceListing(nftId, data.price);
            } else {
                await createAuction(nftId, data);
            }
            await refreshData();
            setShowCreateListing(false);
        } catch (err: any) {
            alert(`Error creating listing: ${err.message}`);
        }
    };

    const formatNFTDescription = (nft: NFT) => {
        let desc = nft.isFirstOfSet ? '**FIRST OF SET** ' : '';
        desc += nft.color + ` ${nft.thing}`;
        if (nft.props?.length) {
            desc += ` with ${nft.props.map(p => p.name).join(', ')}`;
        }
        return desc;
    };

    return (
        <div className="p-5">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h1 className="m-0 mb-1 text-3xl font-bold">NFT Marketplace</h1>
                    {userProfile && (
                        <div className="text-sm text-gray-500">
                            Welcome, <strong>{userProfile.username}</strong>
                            {' • '}Balance: <strong className="text-green-600">${userProfile.balance}</strong>
                            {' • '}NFTs: <strong>{userProfile.nfts?.length ?? 0}</strong>
                        </div>
                    )}
                </div>
                <div className="flex gap-2.5">
                    <button onClick={() => setShowGenerateNFT(true)} className="btn-info">
                        🎲 Generate NFT
                    </button>
                    <button onClick={() => setShowMyAuctions(true)} className="btn-secondary">
                        📊 My Activity
                    </button>
                    <button onClick={() => setShowCreateListing(true)} className="btn-success">
                        + Create Listing
                    </button>
                </div>
            </div>

            {error && <p className="text-red-600 mb-5">{error}</p>}

            {/* Tab Navigation */}
            <div className="mb-5 border-b-2 border-gray-200 flex">
                {(['fixed', 'auctions'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 border-none bg-transparent cursor-pointer text-base ${
                            activeTab === tab
                                ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
                                : 'text-gray-500'
                        }`}
                    >
                        {tab === 'fixed' ? `🏷️ Fixed Price (${nfts.length})` : `🔨 Auctions (${auctions.length})`}
                    </button>
                ))}
            </div>

            {/* Fixed Price Listings */}
            {activeTab === 'fixed' && (
                <div>
                    <h2 className="mb-4 text-xl font-semibold">Fixed Price Listings</h2>
                    {nfts.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">No fixed-price listings available</p>
                    ) : (
                        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {nfts.map(nft => (
                                <div key={nft._id} className="border border-gray-200 p-4 rounded-lg bg-white">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-gray-700 text-base font-semibold leading-tight m-0 flex-1 mr-2">
                                            {formatNFTDescription(nft)}
                                        </h3>
                                        <span className={`text-white text-xs px-2 py-0.5 rounded whitespace-nowrap ${MARKET_STATUS_BADGE[nft.marketStatus] ?? 'bg-gray-400'}`}>
                                            {nft.marketStatus}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2">
                                        <span style={{ color: RARITY_COLORS[nft.colorRarity] }}>
                                            Color: {nft.colorRarity}
                                        </span>
                                        {nft.propRarity !== 'notPresent' && (
                                            <>
                                                {' • '}
                                                <span style={{ color: RARITY_COLORS[nft.propRarity] }}>
                                                    Props: {nft.propRarity}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 my-1">
                                        <strong>Collection:</strong> {nft.collectionName}
                                    </p>
                                    {nft.ownerId && (
                                        <p className="text-sm text-gray-500 my-1">
                                            <strong>Seller:</strong> {nft.ownerId.username}
                                        </p>
                                    )}
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-lg font-bold text-green-600">${nft.currentPrice}</span>
                                        <button
                                            onClick={() => handleBuy(nft._id)}
                                            disabled={nft.ownerId?._id === currentUserId}
                                            className={`px-4 py-2 rounded text-white text-sm ${
                                                nft.ownerId?._id === currentUserId
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                            }`}
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
                    <h2 className="mb-4 text-xl font-semibold">Active Auctions</h2>
                    {auctions.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">No active auctions available</p>
                    ) : (
                        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                            {auctions.map(auction => (
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

            {showCreateListing && (
                <CreateListing
                    userNFTs={userNFTs}
                    onCreateListing={handleCreateListing}
                    onClose={() => setShowCreateListing(false)}
                />
            )}

            {showMyAuctions && (
                <MyAuctions onClose={() => setShowMyAuctions(false)} />
            )}

            {showGenerateNFT && (
                <GenerateNFT
                    onClose={() => setShowGenerateNFT(false)}
                    onNFTGenerated={refreshData}
                />
            )}
        </div>
    );
};

export default Marketplace;

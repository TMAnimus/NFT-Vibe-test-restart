const API_URL = 'http://localhost:3000/api'; // Assuming the server runs on port 3000

const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

export const registerPlayer = async (username: string, pin: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username, pin }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register');
    }

    return response.json();
};

export const loginPlayer = async (username: string, pin: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username, pin }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login');
    }

    const data = await response.json();
    return data.token;
};

export const getListedNFTs = async () => {
    const response = await fetch(`${API_URL}/marketplace/listed`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch listed NFTs');
    }

    return response.json();
};

export const getActiveAuctions = async () => {
    const response = await fetch(`${API_URL}/auctions/active`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch active auctions');
    }

    return response.json();
};

export const getUserNFTs = async () => {
    const response = await fetch(`${API_URL}/nft/my-nfts`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user NFTs');
    }

    return response.json();
};

export const createFixedPriceListing = async (nftId: string, price: number) => {
    const response = await fetch(`${API_URL}/marketplace/list`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ nftId, price }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing');
    }

    return response.json();
};

export const createAuction = async (nftId: string, auctionData: {
    auctionType: string;
    startingBid: number;
    duration: number;
    reservePrice?: number;
}) => {
    const response = await fetch(`${API_URL}/auctions/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            nftId,
            ...auctionData
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create auction');
    }

    return response.json();
};

export const placeBid = async (auctionId: string, bidAmount: number) => {
    const response = await fetch(`${API_URL}/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bidAmount }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place bid');
    }

    return response.json();
};

export const buyNFT = async (nftId: string) => {
    const response = await fetch(`${API_URL}/marketplace/buy/${nftId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to buy NFT');
    }

    return response.json();
};

export const getMyAuctions = async () => {
    const response = await fetch(`${API_URL}/auctions/my-auctions`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch my auctions');
    }

    return response.json();
};

export const getMyBids = async () => {
    const response = await fetch(`${API_URL}/auctions/my-bids`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch my bids');
    }

    return response.json();
};

export const getAuctionDetails = async (auctionId: string) => {
    const response = await fetch(`${API_URL}/auctions/${auctionId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch auction details');
    }

    return response.json();
};

export const cancelAuction = async (auctionId: string) => {
    const response = await fetch(`${API_URL}/auctions/${auctionId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel auction');
    }

    return response.json();
};

export const generateNFT = async (collectionName: string) => {
    const response = await fetch(`${API_URL}/nft/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ collectionName }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate NFT');
    }

    return response.json();
};

export const getUserProfile = async () => {
    const response = await fetch(`${API_URL}/user/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user profile');
    }

    return response.json();
};

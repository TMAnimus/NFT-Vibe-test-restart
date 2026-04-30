const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

/** Decode the JWT expiry and return true if the token is still valid. */
export const isTokenValid = (): boolean => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // exp is in seconds; Date.now() is in ms
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

/**
 * Central fetch wrapper. Throws on non-OK responses and automatically
 * clears the stored token + redirects to /login on 401.
 */
const apiFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
    const response = await fetch(url, options);

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('jwt_token');
            window.location.href = '/login';
        }
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || 'Request failed');
    }

    return response.json();
};

export const registerPlayer = async (username: string, pin: string) => {
    return apiFetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username, pin }),
    });
};

export const loginPlayer = async (username: string, pin: string) => {
    const data = await apiFetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username, pin }),
    });
    return data.token;
};

export const getListedNFTs = async () => {
    return apiFetch(`${API_URL}/marketplace/listed`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
};

export const getActiveAuctions = async () => {
    return apiFetch(`${API_URL}/auctions/active`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
};

export const getUserNFTs = async () => {
    return apiFetch(`${API_URL}/nft/my-nfts`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
};

export const createFixedPriceListing = async (nftId: string, price: number) => {
    return apiFetch(`${API_URL}/marketplace/list`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ nftId, price }),
    });
};

export const createAuction = async (nftId: string, auctionData: {
    auctionType: string;
    startingBid: number;
    duration: number;
    reservePrice?: number;
}) => {
    return apiFetch(`${API_URL}/auctions/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ nftId, ...auctionData }),
    });
};

export const placeBid = async (auctionId: string, bidAmount: number) => {
    return apiFetch(`${API_URL}/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bidAmount }),
    });
};

export const buyNFT = async (nftId: string) => {
    return apiFetch(`${API_URL}/marketplace/buy/${nftId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
};

export const getMyAuctions = async () => {
    return apiFetch(`${API_URL}/auctions/my-auctions`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
};

export const getMyBids = async () => {
    return apiFetch(`${API_URL}/auctions/my-bids`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
};

export const getAuctionDetails = async (auctionId: string) => {
    return apiFetch(`${API_URL}/auctions/${auctionId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
};

export const cancelAuction = async (auctionId: string) => {
    return apiFetch(`${API_URL}/auctions/${auctionId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
};

export const generateNFT = async (collectionName: string) => {
    return apiFetch(`${API_URL}/nft/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ collectionName }),
    });
};

export const getUserProfile = async () => {
    return apiFetch(`${API_URL}/user/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
};

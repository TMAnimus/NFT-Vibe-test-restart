// marketplace.js

// Socket.IO client setup
let socket = null;

function initializeSocket() {
  const token = localStorage.getItem('jwt');
  if (!token) return;

  // Connect to Socket.IO server
  socket = io({
    auth: {
      token: token
    }
  });

  // Connection events
  socket.on('connect', () => {
    console.log('Connected to real-time server');
    socket.emit('joinMarketplace');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from real-time server');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  // Marketplace events
  socket.on('listingCreated', (data) => {
    console.log('New listing created:', data);
    const displayName = `${data.nft.color || ''} ${data.nft.thing || ''}`.trim() || data.nft.collectionName || 'Unnamed NFT';
    showNotification(`New NFT listed: ${displayName} for $${data.nft.currentPrice}`);
    fetchAndRenderNFTs(getCurrentFilters());
  });

  socket.on('listingSold', (data) => {
    console.log('NFT sold:', data);
    const displayName = `${data.nft.color || ''} ${data.nft.thing || ''}`.trim() || data.nft.collectionName || 'Unnamed NFT';
    showNotification(`NFT sold: ${displayName} to ${data.buyer}`);
    fetchAndRenderNFTs(getCurrentFilters());
  });

  socket.on('marketUpdate', (data) => {
    console.log('Market update:', data);
    if (data.type === 'tick') {
      showNotification(`Market tick processed at ${new Date(data.tickTime).toLocaleTimeString()}`);
    } else {
      showNotification('Market updated with new prices and events');
    }
    fetchAndRenderNFTs(getCurrentFilters());
  });

  socket.on('notification', (data) => {
    console.log('Personal notification:', data);
    showNotification(data.message);
  });

  socket.on('globalNotification', (data) => {
    console.log('Global notification:', data);
    showNotification(data.message);
  });
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px;
    border-radius: 5px;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;

  document.body.appendChild(notification);

  // Remove notification after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

function setupLoginUI() {
  const loginForm = document.getElementById('login-form');
  const loginSection = document.getElementById('login-section');
  const loginState = document.getElementById('login-state');
  const loginUser = document.getElementById('login-user');
  const logoutBtn = document.getElementById('logout-btn');
  const loginError = document.getElementById('login-error');
  const listNftSection = document.getElementById('list-nft-section');

  // Show login state if already logged in
  const user = getLoggedInUser();
  if (user) {
    loginForm.style.display = 'none';
    loginState.style.display = '';
    loginUser.textContent = `Logged in as ${user.username}`;
    listNftSection.style.display = '';
    fetchAndPopulateUserNFTs();
  } else {
    loginForm.style.display = '';
    loginState.style.display = 'none';
    listNftSection.style.display = 'none';
  }

  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const username = document.getElementById('login-username').value.trim();
    const pin = document.getElementById('login-pin').value.trim();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin })
      });
      if (!res.ok) {
        const data = await res.json();
        loginError.textContent = data.message || 'Login failed';
        return;
      }
      const data = await res.json();
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('username', username);
      loginForm.style.display = 'none';
      loginState.style.display = '';
      loginUser.textContent = `Logged in as ${username}`;
      listNftSection.style.display = '';
      fetchAndPopulateUserNFTs();
      
      // Initialize Socket.IO connection after login
      initializeSocket();
    } catch (err) {
      loginError.textContent = 'Network error';
    }
  };

  logoutBtn.onclick = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    loginForm.style.display = '';
    loginState.style.display = 'none';
    listNftSection.style.display = 'none';
    
    // Disconnect Socket.IO on logout
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  setupListNftForm();
}

function getLoggedInUser() {
  const token = localStorage.getItem('jwt');
  const username = localStorage.getItem('username');
  if (token && username) return { token, username };
  return null;
}

function setupFiltersUI() {
  const form = document.getElementById('filters-form');
  if (!form) return;
  form.addEventListener('change', () => {
    fetchAndRenderNFTs(getCurrentFilters());
  });
}

function getCurrentFilters() {
  return {
    colorRarity: document.getElementById('filter-colorRarity').value,
    propRarity: document.getElementById('filter-propRarity').value,
    blockchain: document.getElementById('filter-blockchain').value,
    minPrice: document.getElementById('filter-minPrice').value,
    maxPrice: document.getElementById('filter-maxPrice').value
  };
}

async function fetchAndRenderNFTs(filters = {}) {
  const container = document.getElementById('nft-container');
  container.innerHTML = '<p>Loading NFTs...</p>';

  try {
    // Build query string from filters
    const params = new URLSearchParams();
    if (filters.colorRarity) params.append('colorRarity', filters.colorRarity);
    if (filters.propRarity) params.append('propRarity', filters.propRarity);
    if (filters.blockchain) params.append('blockchain', filters.blockchain);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    const response = await fetch('/api/marketplace/listed' + (params.toString() ? `?${params}` : ''));
    if (!response.ok) throw new Error('Failed to fetch NFTs');
    const nfts = await response.json();
    if (!nfts.length) {
      container.innerHTML = '<p>No NFTs are currently listed for sale.</p>';
      return;
    }
    container.innerHTML = '';
    const user = getLoggedInUser();
    nfts.forEach(nft => {
      const card = document.createElement('div');
      card.className = 'nft-card';
      // Create display name from color, thing, and collection
      const displayName = `${nft.color || ''} ${nft.thing || ''}`.trim() || nft.collectionName || 'Unnamed NFT';
      // Compose title with [First of Set] if applicable
      let title = displayName;
      if (nft.isFirstOfSet) title += ' [First of Set]';
      card.innerHTML = `
        <h3>${title}</h3>
        <p><strong>Price:</strong> $${nft.currentPrice}</p>
        <p><strong>Color Rarity:</strong> ${nft.colorRarity || '-'}</p>
        <p><strong>Prop Rarity:</strong> ${nft.propRarity || '-'}</p>
        <p><strong>Blockchain:</strong> ${nft.blockchain || '-'}</p>
        <div class="nft-card-actions"></div>
        <span class="nft-card-feedback"></span>
      `;
      // Buy button logic
      const actions = card.querySelector('.nft-card-actions');
      const feedback = card.querySelector('.nft-card-feedback');
      const isOwned = user && nft.ownerId && (nft.ownerId === user.userId || nft.ownerId === user.username);
      if (user && !isOwned) {
        const buyBtn = document.createElement('button');
        buyBtn.textContent = 'Buy';
        buyBtn.onclick = async () => {
          feedback.textContent = 'Processing...';
          buyBtn.disabled = true;
          try {
            const res = await fetch(`/api/marketplace/buy/${nft._id}`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (!res.ok) {
              feedback.textContent = data.message || 'Purchase failed.';
              buyBtn.disabled = false;
              return;
            }
            feedback.textContent = 'Purchase successful!';
            fetchAndRenderNFTs(getCurrentFilters());
            fetchAndPopulateUserNFTs && fetchAndPopulateUserNFTs();
          } catch (err) {
            feedback.textContent = 'Network error.';
            buyBtn.disabled = false;
          }
        };
        actions.appendChild(buyBtn);
      } else if (!user) {
        const buyBtn = document.createElement('button');
        buyBtn.textContent = 'Buy';
        buyBtn.disabled = true;
        buyBtn.title = 'Log in to buy';
        actions.appendChild(buyBtn);
      } else {
        // Owned by user, no buy button
      }
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p class="error">Error loading NFTs: ${err.message}</p>`;
  }
}

async function fetchAndPopulateUserNFTs() {
  const user = getLoggedInUser();
  const select = document.getElementById('list-nft-select');
  const noneMsg = document.getElementById('list-nft-none');
  const form = document.getElementById('list-nft-form');
  if (!user || !select) return;
  select.innerHTML = '';
  noneMsg.style.display = 'none';
  form.querySelector('button[type="submit"]').disabled = false;
  try {
    const res = await fetch('/api/user/profile', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch NFTs');
    const data = await res.json();
    const nfts = data.nfts || [];
    if (!nfts.length) {
      select.innerHTML = '';
      form.querySelector('button[type="submit"]').disabled = true;
      noneMsg.textContent = 'You have no NFTs to list.';
      noneMsg.style.display = '';
      return;
    }
    nfts.forEach(nft => {
      const option = document.createElement('option');
      option.value = nft._id;
      // Create display name from color, thing, and collection
      const displayName = `${nft.color || ''} ${nft.thing || ''}`.trim() || nft.collectionName || 'Unnamed NFT';
      // Compose option text with [First of Set] and [blockchain] if applicable
      let optionText = displayName;
      if (nft.isFirstOfSet) optionText += ' [First of Set]';
      if (nft.blockchain) optionText += ` [${nft.blockchain}]`;
      option.textContent = optionText;
      select.appendChild(option);
    });
  } catch (err) {
    select.innerHTML = '';
    form.querySelector('button[type="submit"]').disabled = true;
    noneMsg.textContent = 'Error loading your NFTs.';
    noneMsg.style.display = '';
  }
}

function setupListNftForm() {
  const listNftForm = document.getElementById('list-nft-form');
  const feedback = document.getElementById('list-nft-feedback');
  if (!listNftForm) return;
  listNftForm.onsubmit = async (e) => {
    e.preventDefault();
    feedback.textContent = '';
    const select = document.getElementById('list-nft-select');
    const nftId = select.value;
    const price = Number(document.getElementById('list-nft-price').value);
    const user = getLoggedInUser();
    if (!user) {
      feedback.textContent = 'You must be logged in.';
      return;
    }
    try {
      const res = await fetch('/api/marketplace/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ nftId, price })
      });
      const data = await res.json();
      if (!res.ok) {
        feedback.textContent = data.message || 'Failed to list NFT.';
        return;
      }
      feedback.textContent = 'NFT listed successfully!';
      listNftForm.reset();
      fetchAndRenderNFTs();
      fetchAndPopulateUserNFTs(); // Refresh dropdown
    } catch (err) {
      feedback.textContent = 'Network error.';
    }
  };
}

async function updateTickStatus() {
  try {
    const response = await fetch('/api/tick/status');
    const status = await response.json();
    
    const statusText = document.getElementById('tick-status-text');
    if (statusText) {
      if (status.isRunning) {
        statusText.textContent = `Running (${status.interval}ms interval)`;
        statusText.style.color = '#4CAF50';
      } else {
        statusText.textContent = 'Stopped';
        statusText.style.color = '#f44336';
      }
    }
  } catch (error) {
    console.error('Failed to fetch tick status:', error);
    const statusText = document.getElementById('tick-status-text');
    if (statusText) {
      statusText.textContent = 'Error';
      statusText.style.color = '#f44336';
    }
  }
}

// Add Generate NFT button in test mode
function setupGenerateNftTestButton() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('test')) return;
  const container = document.getElementById('generate-nft-test-btn-container');
  if (!container) return;
  const btn = document.createElement('button');
  btn.textContent = 'Generate NFT (Test Mode)';
  btn.style.margin = '16px 0';
  btn.onclick = async () => {
    const collectionName = prompt('Enter collection name (see /server/sets/):');
    if (!collectionName) return;
    const user = getLoggedInUser();
    if (!user) {
      showNotification('You must be logged in to generate an NFT.');
      return;
    }
    btn.disabled = true;
    try {
      const res = await fetch('/api/nft/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ collectionName })
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(data.message || 'Failed to generate NFT.');
        btn.disabled = false;
        return;
      }
      showNotification('NFT generated!');
      fetchAndPopulateUserNFTs && fetchAndPopulateUserNFTs();
    } catch (err) {
      showNotification('Network error.');
    } finally {
      btn.disabled = false;
    }
  };
  container.appendChild(btn);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupLoginUI();
  setupFiltersUI();
  fetchAndRenderNFTs();
  initializeSocket();
  updateTickStatus();
  setupGenerateNftTestButton();
}); 
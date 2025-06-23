// marketplace.js

document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderNFTs();
});

async function fetchAndRenderNFTs() {
  const container = document.getElementById('nft-container');
  container.innerHTML = '<p>Loading NFTs...</p>';

  try {
    const response = await fetch('/api/marketplace/listed');
    if (!response.ok) throw new Error('Failed to fetch NFTs');
    const nfts = await response.json();
    if (!nfts.length) {
      container.innerHTML = '<p>No NFTs are currently listed for sale.</p>';
      return;
    }
    container.innerHTML = '';
    nfts.forEach(nft => {
      const card = document.createElement('div');
      card.className = 'nft-card';
      card.innerHTML = `
        <h3>${nft.displayName || nft.name || 'Unnamed NFT'}</h3>
        <p><strong>Price:</strong> $${nft.currentPrice}</p>
        <p><strong>Color Rarity:</strong> ${nft.colorRarity || '-'}</p>
        <p><strong>Prop Rarity:</strong> ${nft.propRarity || '-'}</p>
        <button disabled>Buy (coming soon)</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p class="error">Error loading NFTs: ${err.message}</p>`;
  }
} 
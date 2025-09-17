import React, { useState } from 'react';
import { generateNFT } from '../services/api';

interface GenerateNFTProps {
  onClose: () => void;
  onNFTGenerated: () => void;
}

const GenerateNFT: React.FC<GenerateNFTProps> = ({ onClose, onNFTGenerated }) => {
  const [collectionName, setCollectionName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Available collections (these should match what's in the backend)
  const availableCollections = [
    'Crypto Toasters',
    'Digital Potatoes', 
    'Blockchain Bananas',
    'NFT Ninjas',
    'Pixel Pandas'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!collectionName) {
      setError('Please select a collection');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newNFT = await generateNFT(collectionName);
      
      // Show success message or handle the new NFT
      alert(`Successfully generated: ${newNFT.displayName || `${newNFT.color} ${newNFT.thing}`}`);
      
      onNFTGenerated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        maxWidth: '400px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Generate New NFT</h2>
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

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Choose Collection:
            </label>
            <select
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              required
            >
              <option value="">Select a collection...</option>
              {availableCollections.map(collection => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '12px', color: '#6c757d', margin: '8px 0 0 0' }}>
              Each NFT will have randomly generated colors, properties, and rarity levels.
            </p>
          </div>

          <div style={{
            backgroundColor: '#e3f2fd',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>🎲 What You'll Get:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#495057' }}>
              <li>Random color with rarity (common to very rare)</li>
              <li>Random properties with individual rarities</li>
              <li>Chance for <strong>**FIRST OF SET**</strong> designation</li>
              <li>Unique combination within the collection</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: '1px solid #6c757d',
                backgroundColor: 'white',
                color: '#6c757d',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: loading ? '#6c757d' : '#28a745',
                color: 'white',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <span>Generating...</span>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </>
              ) : (
                <>🎲 Generate NFT</>
              )}
            </button>
          </div>
        </form>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default GenerateNFT;
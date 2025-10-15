import { useState } from 'react';
import { generateNFT } from '../services/api';

interface GenerateNFTProps {
  onClose: () => void;
  onNFTGenerated: () => void;
}

const GenerateNFT: React.FC<GenerateNFTProps> = ({ onClose, onNFTGenerated }) => {
  const [collectionName, setCollectionName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Available collections (these match the collections in server/sets)
  const availableCollections = [
    'Apathetic Axolotls',
    'Crypto Bananas',
    'Cynical Capybaras',
    'Distracted Degenerates',
    'Disinterested Ducks',
    'Crypto Lamps',
    'Crypto Mugs',
    'Crypto Clips',
    'Crypto Pencils',
    'Crypto Plants',
    'Crypto Potatoes',
    'Sleepy Sloths',
    'Crypto Socks',
    'Crypto Toast',
    'Crypto Toasters'
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
    <div className="modal-overlay">
      <div className="modal-content p-8 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Generate New NFT</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Choose Collection:
            </label>
            <select
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className="select-field text-base"
              required
            >
              <option value="">Select a collection...</option>
              {availableCollections.map(collection => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Each NFT will have randomly generated colors, properties, and rarity levels.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-blue-800 font-semibold mb-3 flex items-center">
              🎲 What You'll Get:
            </h4>
            <ul className="text-sm text-gray-700 space-y-1 pl-4">
              <li className="list-disc">Random color with rarity (common to very rare)</li>
              <li className="list-disc">Random properties with individual rarities</li>
              <li className="list-disc">Chance for <strong>**FIRST OF SET**</strong> designation</li>
              <li className="list-disc">Unique combination within the collection</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-5 py-2 border border-gray-400 text-gray-600 rounded-lg font-medium transition-all ${loading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-50 hover:border-gray-500'
                }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'btn-success'
                }`}
            >
              {loading ? (
                <>
                  <span>Generating...</span>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                <>🎲 Generate NFT</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateNFT;
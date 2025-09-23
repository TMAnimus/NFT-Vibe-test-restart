import { generateNft } from './nftGenerationService';
import NFTSetModel from '../models/NFTSet';
import NFTModel from '../models/NFT';
import { Rarity, CollectionStatus } from '../models/enums';

// Mock the Mongoose models
jest.mock('../models/NFTSet');
jest.mock('../models/NFT'); // Jest automatically mocks the class with a mock constructor

describe('NFT Generation Service', () => {
  let randomSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock Math.random to make attribute selection predictable
    randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    jest.clearAllMocks();
    randomSpy.mockRestore(); // Restore original Math.random
  });

  it('should generate a new NFT successfully when a valid collection is found', async () => {
    const mockCollectionName = 'Test Toasters';
    const mockSet = {
      _id: '60c72b965f1b2c001f6e4d1a',
      thing: 'Toaster',
      collectionName: mockCollectionName,
      blockchain: 'ETH',
      collectionStatus: 'active',
      basePrice: 100,
      colors: [{ name: 'red', weight: 1, rarity: Rarity.Uncommon }],
      props: [{ name: 'hat', weight: 1, rarity: Rarity.Rare, verb: 'with' }],
      backgrounds: [{ name: 'blue', weight: 1, rarity: Rarity.Common }],
      expressions: [{ name: 'happy', weight: 1, rarity: Rarity.VeryRare }],
    };
    (NFTSetModel.findOne as jest.Mock).mockResolvedValue(mockSet);
    
    // Mock countDocuments to return 0 (first NFT of set)
    (NFTModel.countDocuments as jest.Mock).mockResolvedValue(0);
    
    // Mock the .save() method on the instances created by the NFTModel mock constructor
    const saveMock = jest.fn().mockResolvedValue({});
    (NFTModel as any).mockImplementation(() => ({
      save: saveMock,
    }));

    await generateNft(mockCollectionName);

    expect(NFTSetModel.findOne).toHaveBeenCalledWith({ collectionName: mockCollectionName });
    expect(NFTModel.countDocuments).toHaveBeenCalledWith({ setId: mockSet._id });
    expect(NFTModel).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledTimes(1);

    // To check the data passed to the constructor, we access the mock calls
    const constructorArgs = (NFTModel as any).mock.calls[0][0];
    expect(constructorArgs.setId).toBe(mockSet._id);
    expect(constructorArgs.collectionName).toBe(mockCollectionName);
    expect(constructorArgs.basePrice).toBe(mockSet.basePrice);
    expect(constructorArgs.color).toBe('red');
    expect(constructorArgs.thing).toBe('Toaster');
    expect(constructorArgs.colorRarity).toBe(Rarity.Uncommon);
    expect(constructorArgs.propRarity).toBe(Rarity.Rare);
    expect(constructorArgs.blockchain).toBe('');
    expect(constructorArgs.isFirstOfSet).toBe(true);
    expect(constructorArgs.status).toBe(CollectionStatus.New);

    // Price calculation: 100 * 1.5 (uncommon) * 2.5 (rare) = 375
    expect(constructorArgs.currentPrice).toBe(375);

    expect(constructorArgs.props).toEqual([
      { name: 'hat', rarity: Rarity.Rare }
    ]);
  });

  it('should throw an error if the NFT set collection is not found', async () => {
    const mockCollectionName = 'Non-Existent Toasters';
    (NFTSetModel.findOne as jest.Mock).mockResolvedValue(null);

    await expect(generateNft(mockCollectionName)).rejects.toThrow(
      `NFT Set with collection name "${mockCollectionName}" not found.`
    );

    expect(NFTSetModel.findOne).toHaveBeenCalledWith({ collectionName: mockCollectionName });
    expect(NFTModel).not.toHaveBeenCalled();
  });
}); 
import { generateNft } from './nftGenerationService';
import NFTSetModel from '../models/NFTSet';
import NFTModel from '../models/NFT';

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
      colors: [{ name: 'red', weight: 1, rarity: 'uncommon' }],
      props: [{ name: 'hat', weight: 1, rarity: 'rare', verb: 'with' }],
      backgrounds: [{ name: 'blue', weight: 1, rarity: 'common' }],
      expressions: [{ name: 'happy', weight: 1, rarity: 'veryRare' }],
    };
    (NFTSetModel.findOne as jest.Mock).mockResolvedValue(mockSet);
    
    // Mock the .save() method on the instances created by the NFTModel mock constructor
    const saveMock = jest.fn().mockResolvedValue({});
    (NFTModel as any).mockImplementation(() => ({
      save: saveMock,
    }));

    await generateNft(mockCollectionName);

    expect(NFTSetModel.findOne).toHaveBeenCalledWith({ collectionName: mockCollectionName });
    expect(NFTModel).toHaveBeenCalledTimes(1);
    
    expect(saveMock).toHaveBeenCalledTimes(1);

    // To check the data passed to the constructor, we access the mock calls
    const constructorArgs = (NFTModel as any).mock.calls[0][0];
    expect(constructorArgs.setId).toBe(mockSet._id);
    expect(constructorArgs.collectionName).toBe(mockCollectionName);
    expect(constructorArgs.basePrice).toBe(mockSet.basePrice);

    // 100 * 1.5 * 2.5 * 1 * 5 = 1875
    expect(constructorArgs.currentPrice).toBe(1875);

    expect(constructorArgs.attributes).toEqual({
      color: 'red',
      prop: 'hat',
      background: 'blue',
      expression: 'happy',
    });
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
import NFTSetModel, { INFTSet } from '../models/NFTSet';
import { Rarity, CollectionStatus } from '../models/enums';
import NFTModel from '../models/NFT';

interface IAttribute {
  name: string;
  rarity: Rarity;
  weight: number;
}

const rarityMultipliers = {
  common: 1,
  uncommon: 1.5,
  rare: 2.5,
  veryrare: 5,
  notPresent: 1, // No price impact
};

/**
 * Selects an attribute from an array based on their weights.
 *
 * @param {IAttribute[]} values - An array of attributes.
 * @returns {IAttribute} The selected attribute.
 */
function weightedRandomSelect(values: IAttribute[]): IAttribute {
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of values) {
    if (random < item.weight) {
      return item;
    }
    random -= item.weight;
  }

  // Fallback, should ideally not be reached if weights are positive
  return values[0];
}

/**
 * Generates a new, unique NFT for a given collection.
 *
 * @param {string} collectionName - The name of the collection to generate an NFT for.
 * @returns {Promise<any>} The newly created NFT document.
 */
export async function generateNft(collectionName: string): Promise<any> {
  const nftSet = await NFTSetModel.findOne({ collectionName: collectionName });

  if (!nftSet) {
    throw new Error(`NFT Set with collection name "${collectionName}" not found.`);
  }

  // Check if this is the first NFT of this set
  const existingNFTs = await NFTModel.countDocuments({ setId: nftSet._id });
  const isFirstOfSet = existingNFTs === 0;

  // Select color and thing
  let selectedColor: IAttribute | null = null;
  let selectedThing: string = '';
  let selectedProps: IAttribute[] = [];

  if (nftSet.colors?.length) {
    selectedColor = weightedRandomSelect(nftSet.colors);
  }

  // Use the thing from the NFT set
  selectedThing = nftSet.thing;

  // Select props (up to 3 props)
  if (nftSet.props?.length) {
    const numProps = Math.min(3, nftSet.props.length);
    for (let i = 0; i < numProps; i++) {
      const selected = weightedRandomSelect(nftSet.props);
      selectedProps.push(selected);
    }
  }

  // Determine overall rarity based on highest rarity among attributes
  const allAttributes = [selectedColor, ...selectedProps].filter(Boolean);
  const rarityOrder = [Rarity.Common, Rarity.Uncommon, Rarity.Rare, Rarity.VeryRare];
  let overallRarity = Rarity.Common;
  
  for (const attr of allAttributes) {
    if (attr && rarityOrder.indexOf(attr.rarity) > rarityOrder.indexOf(overallRarity)) {
      overallRarity = attr.rarity;
    }
  }

  // Calculate the current price based on rarities
  const priceMultiplier = allAttributes.reduce(
    (total, attr) => total * (rarityMultipliers[attr?.rarity || 'common'] || 1),
    1
  );
  const calculatedPrice = nftSet.basePrice * priceMultiplier;

  const newNft = new NFTModel({
    setId: nftSet._id,
    collectionName: nftSet.collectionName,
    color: selectedColor?.name || '',
    thing: selectedThing,
    props: selectedProps.map(prop => ({ name: prop.name, rarity: prop.rarity })),
    rarity: overallRarity,
    colorRarity: selectedColor?.rarity || Rarity.Common,
    propRarity: selectedProps.length > 0 ? selectedProps[0].rarity : Rarity.NotPresent,
    blockchain: '', // Default to blank as requested
    basePrice: nftSet.basePrice,
    currentPrice: calculatedPrice,
    status: CollectionStatus.New,
    isFirstOfSet: isFirstOfSet,
  });

  await newNft.save();
  console.log(`Generated new NFT for collection: ${collectionName}`, newNft);
  return newNft;
} 
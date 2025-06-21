import NFTSetModel, { INFTSet, Rarity } from '../models/NFTSet';
import NFTModel from '../models/NFT';

interface IAttribute {
  name: string;
  rarity: Rarity;
  weight: number;
}

const rarityPriceMultipliers: { [key in Rarity]: number } = {
  common: 1,
  uncommon: 1.5,
  rare: 2.5,
  veryRare: 5,
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

  const generatedAttributes: { [key: string]: string } = {};
  const selectedAttributes: IAttribute[] = [];

  // Select attributes and store them
  if (nftSet.colors?.length) {
    const selected = weightedRandomSelect(nftSet.colors);
    generatedAttributes.color = selected.name;
    selectedAttributes.push(selected);
  }
  if (nftSet.props?.length) {
    const selected = weightedRandomSelect(nftSet.props);
    generatedAttributes.prop = selected.name;
    selectedAttributes.push(selected);
  }
  if (nftSet.backgrounds?.length) {
    const selected = weightedRandomSelect(nftSet.backgrounds);
    generatedAttributes.background = selected.name;
    selectedAttributes.push(selected);
  }
  if (nftSet.expressions?.length) {
    const selected = weightedRandomSelect(nftSet.expressions);
    generatedAttributes.expression = selected.name;
    selectedAttributes.push(selected);
  }

  // Calculate the current price based on rarities
  const priceMultiplier = selectedAttributes.reduce(
    (total, attr) => total * (rarityPriceMultipliers[attr.rarity] || 1),
    1
  );
  const calculatedPrice = nftSet.basePrice * priceMultiplier;

  const newNft = new NFTModel({
    setId: nftSet._id,
    collectionName: nftSet.collectionName,
    attributes: generatedAttributes,
    basePrice: nftSet.basePrice,
    currentPrice: calculatedPrice,
  });

  await newNft.save();
  console.log(`Generated new NFT for collection: ${collectionName}`, newNft);
  return newNft;
} 
import { promises as fs } from 'fs';
import path from 'path';
import NFTSetModel, { INFTSet } from '../models/NFTSet';

/**
 * Synchronizes NFT set definitions from JSON files in the server/sets directory
 * with the MongoDB database. It creates new sets or updates existing ones.
 */
export async function syncNftSetsWithFiles() {
  console.log('Starting NFT set synchronization with files...');

  // The service is run from the context of the built JS files in `dist`, 
  // so we need to go up to the project root.
  const setsDirectory = path.resolve(process.cwd(), 'sets');

  try {
    const files = await fs.readdir(setsDirectory);
    const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

    if (jsonFiles.length === 0) {
      console.warn('No JSON set files found in a directory. Skipping sync.');
      return;
    }

    for (const file of jsonFiles) {
      const filePath = path.join(setsDirectory, file);
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const setDefinition = JSON.parse(fileContent) as Omit<INFTSet, 'collectionStatus' | 'basePrice'>;

        // Use the collection name as the unique identifier for finding and updating.
        const filter = { collectionName: setDefinition.collectionName };

        // The file is the source of truth for static data.
        // We use findOneAndUpdate with 'upsert: true' to either create a new document
        // or update an existing one. This approach preserves dynamic fields
        // like 'collectionStatus' that are not present in the JSON files.
        await NFTSetModel.findOneAndUpdate(
          filter,
          setDefinition, // Update with all data from the file
          {
            upsert: true, // Create if it doesn't exist
            new: true, // Return the new document
            setDefaultsOnInsert: true // Apply model defaults on creation
          }
        );

        console.log(`Successfully synced set: ${setDefinition.collectionName}`);

      } catch (parseError) {
        console.error(`Error processing set file ${file}:`, parseError);
      }
    }

    console.log('NFT set synchronization completed.');

  } catch (error) {
    console.error('Failed to read the sets directory or sync with the database:', error);
  }
} 
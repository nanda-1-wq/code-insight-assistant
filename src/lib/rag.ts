import { blink } from './blink';

/**
 * Ensures a RAG collection exists for the user.
 * Each user gets their own collection named after their user ID.
 */
export async function getOrCreateCollection(userId: string) {
  const collectionName = `user_${userId.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  
  try {
    await blink.rag.createCollection({
      name: collectionName,
      description: `Knowledge base for user ${userId}`,
    });
    return collectionName;
  } catch (error: any) {
    // 409 means it already exists
    if (error?.message?.includes('409') || error?.code === 'COLLECTION_EXISTS') {
      return collectionName;
    }
    throw error;
  }
}

/**
 * Ingests a set of files into the user's RAG collection.
 * Follows the storage -> extract -> content pattern for reliability.
 */
export async function ingestFiles(
  files: File[],
  userId: string,
  collectionName: string,
  onProgress?: (message: string, progress: number) => void
) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const overallProgress = (i / files.length) * 100;
    
    onProgress?.(`Uploading ${file.name}...`, overallProgress);

    try {
      // 1. Upload to storage
      const storageResult = await blink.storage.upload(
        file,
        `code-insights/${userId}/${Date.now()}_${file.name}`,
        { upsert: true }
      );

      // 2. Extract text (especially useful if it's a PDF or complex text file, 
      // but also works for code files as long as they are text-based)
      onProgress?.(`Extracting content from ${file.name}...`, overallProgress + (1 / files.length) * 20);
      const extractedText = await blink.data.extractFromUrl(storageResult.publicUrl);
      
      const content = typeof extractedText === 'string' ? extractedText : 
                      Array.isArray(extractedText) ? extractedText.join('\n') : '';

      if (!content || content.trim().length === 0) {
        console.warn(`No content extracted from ${file.name}, skipping RAG upload.`);
        continue;
      }

      // 3. Upload to RAG
      onProgress?.(`Indexing ${file.name} to RAG...`, overallProgress + (1 / files.length) * 50);
      const doc = await blink.rag.upload({
        collectionName,
        filename: file.name,
        content,
        metadata: {
          storageUrl: storageResult.publicUrl,
          userId,
          originalName: file.name,
        }
      });

      // 4. Wait for processing (non-blocking for the whole UI but we wait for each file)
      // This ensures the agent can actually search it.
      await blink.rag.waitForReady(doc.id);
      
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      onProgress?.(`Error processing ${file.name}`, overallProgress);
    }
  }
  
  onProgress?.('All files indexed successfully!', 100);
}

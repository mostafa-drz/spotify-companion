import { adminDb } from '../app/lib/firebase-admin';

const PROMPT_TEMPLATES_COLLECTION = 'promptTemplates';

const defaultTemplates = [
  {
    title: 'Historical Context',
    description: 'Learn about the historical context and cultural significance of the track.',
    template: 'Provide a 1-minute educational overview of the historical context and cultural significance of {trackName} by {artists}. Include key events, influences, and impact on music history.',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Musical Analysis',
    description: 'Understand the musical elements and composition of the track.',
    template: 'Give a 1-minute analysis of the musical elements in {trackName} by {artists}. Cover key aspects like instrumentation, structure, and unique musical features.',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Artist Background',
    description: 'Discover interesting facts about the artists and their journey.',
    template: 'Share a 1-minute story about the artists behind {trackName}, focusing on their background, influences, and journey to creating this track.',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Cultural Impact',
    description: 'Explore how the track influenced culture and society.',
    template: 'Explain in 1 minute how {trackName} by {artists} influenced culture and society. Include its impact on music, fashion, or social movements.',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function initializePromptTemplates() {
  try {
    const batch = adminDb.batch();
    
    // Delete existing templates
    const existingTemplates = await adminDb
      .collection(PROMPT_TEMPLATES_COLLECTION)
      .get();
    
    existingTemplates.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Add new templates
    defaultTemplates.forEach(template => {
      const docRef = adminDb.collection(PROMPT_TEMPLATES_COLLECTION).doc();
      batch.set(docRef, template);
    });

    await batch.commit();
    console.log('Successfully initialized prompt templates');
  } catch (error) {
    console.error('Error initializing prompt templates:', error);
    process.exit(1);
  }
}

initializePromptTemplates(); 
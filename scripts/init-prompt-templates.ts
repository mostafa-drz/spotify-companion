import { adminDb } from '../app/lib/firebase-admin';

const PROMPT_TEMPLATES_COLLECTION = 'promptTemplates';

const defaultTemplates = [
  {
    id: 'historical',
    name: 'Historical Context',
    prompt: 'Focus on the historical context and cultural significance of this track. Include key events, influences, and impact on music history.',
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'technical',
    name: 'Technical Analysis',
    prompt: 'Analyze the musical elements, instrumentation, and technical aspects of this track. Cover structure, composition, and unique musical features.',
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'artist',
    name: 'Artist Background',
    prompt: 'Share insights about the artists behind this track, focusing on their background, influences, and journey to creating this piece.',
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cultural',
    name: 'Cultural Impact',
    prompt: 'Explain how this track influenced culture and society. Include its impact on music, fashion, or social movements.',
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function initializePromptTemplates() {
  try {
    const batch = adminDb.batch();
    
    // Add system templates
    for (const template of defaultTemplates) {
      const docRef = adminDb.collection(PROMPT_TEMPLATES_COLLECTION).doc(template.id);
      batch.set(docRef, template);
    }
    
    await batch.commit();
    console.log('Successfully initialized prompt templates');
  } catch (error) {
    console.error('Error initializing prompt templates:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializePromptTemplates()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { initializePromptTemplates, defaultTemplates }; 
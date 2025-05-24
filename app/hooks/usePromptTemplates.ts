'use client';

import { useState, useEffect } from 'react';
import { collection, doc, getDocs, getDoc, query, where, runTransaction, updateDoc } from 'firebase/firestore';
import { clientDb } from '@/app/lib/firebase';
import { useFirebaseAuth } from '@/app/contexts/FirebaseAuthContext';
import toast from 'react-hot-toast';
import type { PromptTemplate, UserPromptSettings } from '@/app/types/Prompt';

export function usePromptTemplates() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultPrompt, setDefaultPromptState] = useState<string | null>(null);
  const { user } = useFirebaseAuth();

  useEffect(() => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    const fetchTemplates = async () => {
      try {
        // Fetch user templates
        const userTemplatesQuery = query(
          collection(clientDb, 'promptTemplates'),
          where('userId', '==', user.uid)
        );
        const userTemplatesSnapshot = await getDocs(userTemplatesQuery);
        const userTemplates = userTemplatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PromptTemplate[];

        // Fetch system templates
        const systemTemplatesQuery = query(
          collection(clientDb, 'promptTemplates'),
          where('isSystem', '==', true)
        );
        const systemTemplatesSnapshot = await getDocs(systemTemplatesQuery);
        const systemTemplates = systemTemplatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PromptTemplate[];

        // Fetch user prompt settings
        const userDoc = doc(clientDb, 'users', user.uid);
        const userData = (await getDoc(userDoc)).data() as UserPromptSettings | undefined;
        const userDefaultPrompt = userData?.defaultPrompt || null;

        setTemplates([...systemTemplates, ...userTemplates]);
        setDefaultPromptState(userDefaultPrompt);
        setError(null);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates');
        toast.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [user]);

  const createTemplate = async (template: Omit<PromptTemplate, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to create templates');
      return;
    }

    try {
      const newTemplate = {
        ...template,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };

      await runTransaction(clientDb, async (transaction) => {
        const userDoc = doc(clientDb, 'users', user.uid);
        const userData = (await transaction.get(userDoc)).data() as UserPromptSettings | undefined;
        
        if (!userData) {
          throw new Error('User document not found');
        }

        // Create new template
        const templateRef = doc(collection(clientDb, 'promptTemplates'));
        transaction.set(templateRef, newTemplate);

        // Update user's templates array
        transaction.update(userDoc, {
          templates: [...(userData.templates || []), templateRef.id]
        });
      });

      setTemplates(prev => [...prev, { ...newTemplate, id: 'temp-id' }]);
      toast.success('Template created successfully');
    } catch (err) {
      console.error('Error creating template:', err);
      toast.error('Failed to create template');
      throw err;
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<PromptTemplate>) => {
    if (!user) {
      toast.error('You must be logged in to update templates');
      return;
    }

    try {
      const templateRef = doc(clientDb, 'promptTemplates', templateId);
      await updateDoc(templateRef, updates);
      
      setTemplates(prev => 
        prev.map(template => 
          template.id === templateId 
            ? { ...template, ...updates }
            : template
        )
      );
      toast.success('Template updated successfully');
    } catch (err) {
      console.error('Error updating template:', err);
      toast.error('Failed to update template');
      throw err;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete templates');
      return;
    }

    try {
      await runTransaction(clientDb, async (transaction) => {
        const userDoc = doc(clientDb, 'users', user.uid);
        const userData = (await transaction.get(userDoc)).data() as UserPromptSettings | undefined;
        
        if (!userData) {
          throw new Error('User document not found');
        }

        // Delete template
        const templateRef = doc(clientDb, 'promptTemplates', templateId);
        transaction.delete(templateRef);

        // Update user's templates array
        transaction.update(userDoc, {
          templates: (userData.templates || []).filter((id: string) => id !== templateId)
        });
      });

      setTemplates(prev => prev.filter(template => template.id !== templateId));
      toast.success('Template deleted successfully');
    } catch (err) {
      console.error('Error deleting template:', err);
      toast.error('Failed to delete template');
      throw err;
    }
  };

  const setDefaultPrompt = async (prompt: string | null) => {
    if (!user) {
      toast.error('You must be logged in to set default prompt');
      return;
    }

    try {
      const userDoc = doc(clientDb, 'users', user.uid);
      await updateDoc(userDoc, { defaultPrompt: prompt });
      setDefaultPromptState(prompt);
      toast.success(prompt ? 'Default prompt set successfully' : 'Default prompt cleared');
    } catch (err) {
      console.error('Error setting default prompt:', err);
      toast.error('Failed to set default prompt');
      throw err;
    }
  };

  return {
    templates,
    loading,
    error,
    defaultPrompt,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultPrompt,
  };
} 
import { QuestionTypeModel, QuestionType } from '../types/survey';
import { SurveyResponse } from '../types/response';
import { db, auth } from '../config/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, deleteDoc, serverTimestamp, where, arrayUnion, orderBy, addDoc, QueryDocumentSnapshot, runTransaction, Transaction } from 'firebase/firestore';

interface SurveyData {
  id: string;
  title: string;
  questions: QuestionTypeModel[];
  respondents: number;
  responses: SurveyResponse[];
  createdAt: any;
  active: boolean;
  owner: string;
}

export interface DraftSurveyModel {
  id?: string;
  title: string;
  questions: QuestionTypeModel[];
  owner?: string;
  updatedAt?: any;
  createdAt?: any;
}

export interface DraftListItem {
  id: string;
  title: string;
  owner: string;
  updatedAt: Date;
}

export interface CompletedSurveyListItem {
  id: string;
  title: string;
  owner: string;
  completed: Date;
}

export interface ActiveSurveyListItem {
  id: string;
  title: string;
  owner: string;
  respondents: number;
  responses: number;
  progress: number;
  createdAt: Date;
}

class SurveyService {
  private readonly surveysCollection = collection(db, 'surveys');
  private readonly draftsCollection = collection(db, 'drafts');

  constructor() {
    // No initialization needed
  }

  async createSurvey(title: string, questions: QuestionTypeModel[], respondents: number, draftId?: string): Promise<string> {
    try {
      // Check if we're authenticated
      const currentUser = auth.currentUser;
      console.log('Current user:', currentUser?.uid);
      
      if (!currentUser) {
        console.error('No current user found');
        throw new Error('You must be logged in to create a survey');
      }

      console.log('Starting survey creation...');
      
      // Create the full survey data
      const surveyData = {
        title: title || 'Untitled Survey',
        questions: questions.map(q => ({
          id: q.id,
          type: q.type,
          questionText: q.questionText,
          options: q.options || []
        })),
        respondents: Number(respondents) || 0,
        owner: currentUser.uid,
        createdAt: serverTimestamp(),
        active: true,
        responses: [] // Initialize empty responses array
      };
      
      console.log('Attempting to write survey data:', JSON.stringify(surveyData, null, 2));
      
      // Create new survey document
      const docRef = await addDoc(this.surveysCollection, surveyData);
      console.log('Survey created successfully with ID:', docRef.id);

      // Delete the draft if it exists
      if (draftId) {
        const draftRef = doc(this.draftsCollection, draftId);
        await deleteDoc(draftRef);
        console.log('Deleted draft after survey creation');
      }

      return docRef.id;
    } catch (error: any) {
      console.error('Error creating survey:', {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to create surveys');
      } else if (error.code === 'unauthenticated') {
        throw new Error('You must be logged in to create a survey');
      } else if (error.code === 'unavailable') {
        throw new Error('Firebase service is currently unavailable. Please try again later.');
      }
      
      throw new Error(`Failed to create survey: ${error.message}`);
    }
  }

  async getDrafts(): Promise<DraftListItem[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    try {
      const querySnapshot = await getDocs(
        query(
          this.draftsCollection,
          where('owner', '==', currentUser.uid),
          orderBy('updatedAt', 'desc')
        )
      );

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || 'Untitled Survey',
        owner: doc.data().owner,
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching drafts:', error);
      throw error;
    }
  }

  async getDraft(draftId: string): Promise<DraftSurveyModel | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    try {
      const draftDoc = await getDoc(doc(this.draftsCollection, draftId));
      if (!draftDoc.exists()) return null;

      const data = draftDoc.data();
      if (data.owner !== currentUser.uid) throw new Error('Unauthorized');

      return {
        id: draftDoc.id,
        title: data.title || '',
        questions: data.questions || [],
        owner: data.owner,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('Error fetching draft:', error);
      throw error;
    }
  }

  async saveDraft(draftId: string, survey: DraftSurveyModel): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be signed in to save drafts');
      }

      if (!survey.title || !survey.questions) {
        throw new Error('Invalid survey data');
      }

      // Clean up questions data to ensure no undefined values
      const cleanQuestions = survey.questions.map(q => {
        const cleanQuestion: any = {
          id: q.id,
          type: q.type,
          questionText: q.questionText || ''
        };

        // Only include options for non-open-ended questions
        if (q.type !== QuestionType.OPEN_ENDED && q.options && q.options.length > 0) {
          cleanQuestion.options = q.options.map(opt => ({
            id: opt.id,
            text: opt.text || ''
          }));
        }

        // Only add fields that have actual values
        if (typeof q.required === 'boolean') cleanQuestion.required = q.required;
        if (typeof q.answer === 'string' && q.answer.length > 0) cleanQuestion.answer = q.answer;
        if (Array.isArray(q.answers) && q.answers.length > 0) cleanQuestion.answers = q.answers;
        if (typeof q.correctAnswer === 'string' && q.correctAnswer.length > 0) cleanQuestion.correctAnswer = q.correctAnswer;
        if (Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0) cleanQuestion.correctAnswers = q.correctAnswers;
        if (typeof q.maxLength === 'number') cleanQuestion.maxLength = q.maxLength;
        if (typeof q.minLength === 'number') cleanQuestion.minLength = q.minLength;
        if (typeof q.maxValue === 'number') cleanQuestion.maxValue = q.maxValue;
        if (typeof q.minValue === 'number') cleanQuestion.minValue = q.minValue;
        if (typeof q.step === 'number') cleanQuestion.step = q.step;
        if (typeof q.placeholder === 'string' && q.placeholder.length > 0) cleanQuestion.placeholder = q.placeholder;
        if (typeof q.image === 'string' && q.image.length > 0) cleanQuestion.image = q.image;
        if (typeof q.imageLoading === 'boolean') cleanQuestion.imageLoading = q.imageLoading;

        return cleanQuestion;
      });

      const draftRef = doc(this.draftsCollection, draftId);
      const draftData = {
        title: survey.title.trim() || 'Untitled Survey',
        questions: cleanQuestions,
        owner: currentUser.uid,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      await setDoc(draftRef, draftData);
      console.log('Draft saved successfully');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to save drafts');
      }
      throw error;
    }
  }

  async getSurvey(surveyId: string): Promise<SurveyData | null> {
    try {
      const surveyRef = doc(this.surveysCollection, surveyId);
      const surveyDoc = await getDoc(surveyRef);
      
      if (!surveyDoc.exists()) {
        return null;
      }
      
      const data = surveyDoc.data();
      
      // For inactive surveys, we need authentication
      if (!data.active) {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('No authenticated user');
        }
      }
      
      const surveyData = {
        id: surveyDoc.id,
        title: data.title || '',
        questions: data.questions || [],
        respondents: data.respondents || 0,
        responses: data.responses || [],
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        active: data.active || false,
        owner: data.owner || ''
      };
      
      console.log('[getSurvey] Retrieved survey:', {
        id: surveyData.id,
        active: surveyData.active,
        responses: surveyData.responses?.length || 0
      });
      
      return surveyData;
    } catch (error) {
      console.error('[getSurvey] Error:', error);
      throw error;
    }
  }

  async getResponses(surveyId: string): Promise<any[]> {
    try {
      console.log('[getResponses] Fetching responses for survey:', surveyId);
      const surveyDoc = await getDoc(doc(this.surveysCollection, surveyId));
      
      if (surveyDoc.exists()) {
        const data = surveyDoc.data();
        console.log('[getResponses] Survey data:', data);
        
        if (!data.responses) {
          console.log('[getResponses] No responses array found in survey data');
          return [];
        }
        
        console.log('[getResponses] Found responses:', data.responses);
        return data.responses;
      }
      
      console.log('[getResponses] Survey document not found');
      return [];
    } catch (error) {
      console.error('[getResponses] Error getting responses:', error);
      return [];
    }
  }

  async getActiveSurveys(): Promise<ActiveSurveyListItem[]> {
    try {
      console.log('[getActiveSurveys] Fetching active surveys');
      
      // Get all active surveys
      const querySnapshot = await getDocs(
        query(
          this.surveysCollection,
          where('active', '==', true)
        )
      );

      console.log('[getActiveSurveys] Found surveys:', querySnapshot.docs.length);

      const mappedSurveys = await Promise.all(querySnapshot.docs.map(async doc => {
        const data = doc.data();
        const responseCount = data.responses?.length || 0;
        const targetRespondents = data.respondents || 0;
        
        // Calculate progress
        const progress = targetRespondents > 0 
          ? Math.min(100, Math.round((responseCount / targetRespondents) * 100))
          : 0;
        
        console.log('[getActiveSurveys] Survey progress:', {
          id: doc.id,
          responses: responseCount,
          respondents: targetRespondents,
          progress
        });
        
        const mappedItem = {
          id: doc.id,
          title: data.title || 'Untitled Survey',
          owner: data.owner || '',
          progress,
          responses: responseCount,
          respondents: targetRespondents,
          createdAt: data.createdAt?.toDate() || new Date()
        };
        
        console.log('[getActiveSurveys] Mapped survey item:', mappedItem);
        return mappedItem;
      }));

      console.log('[getActiveSurveys] Final mapped surveys:', mappedSurveys);
      return mappedSurveys;
    } catch (error) {
      console.error('[getActiveSurveys] Error:', error);
      throw error;
    }
  }

  async submitSurveyResponse(surveyId: string, response: SurveyResponse): Promise<void> {
    try {
      console.log('[submitSurveyResponse] Starting submission for survey:', surveyId);
      const surveyRef = doc(this.surveysCollection, surveyId);
      
      await runTransaction(db, async (transaction: Transaction) => {
        console.log('[submitSurveyResponse] Starting transaction...');
        const surveyDoc = await transaction.get(surveyRef);
        
        if (!surveyDoc.exists()) {
          throw new Error('Survey not found');
        }
        
        const surveyData = surveyDoc.data();
        console.log('[submitSurveyResponse] Current survey data:', {
          id: surveyId,
          responses: surveyData.responses,
          respondents: surveyData.respondents || 0
        });
        
        // Ensure responses is initialized as an array
        let currentResponses = [];
        if (Array.isArray(surveyData.responses)) {
          currentResponses = surveyData.responses;
        } else if (surveyData.responses === undefined) {
          console.log('[submitSurveyResponse] Initializing responses array');
        } else {
          console.warn('[submitSurveyResponse] Invalid responses format:', surveyData.responses);
        }
        
        // Format the new response, ensuring no undefined values
        const formattedResponse = {
          id: response.id || crypto.randomUUID(),
          surveyId: surveyId,
          answers: response.answers.map(answer => ({
            questionId: answer.questionId || '',
            answer: answer.answer || '',
            answers: answer.answers || [],
            answeredAt: answer.answeredAt || new Date().toISOString()
          })),
          startedAt: response.startedAt || new Date().toISOString(),
          completedAt: response.completedAt || new Date().toISOString(),
          submittedAt: new Date().toISOString()
        };
        
        console.log('[submitSurveyResponse] Adding new response:', formattedResponse);
        
        // Update the document atomically - only add the response, don't change respondents
        const updateData = {
          responses: [...currentResponses, formattedResponse]
        };
        
        console.log('[submitSurveyResponse] Updating with:', updateData);
        transaction.update(surveyRef, updateData);
        console.log('[submitSurveyResponse] Transaction complete');
      });
      
      // Verify the update
      const verifyDoc = await getDoc(surveyRef);
      const verifyData = verifyDoc.data();
      console.log('[submitSurveyResponse] Post-update verification:', {
        id: surveyId,
        responses: verifyData?.responses?.length || 0,
        respondents: verifyData?.respondents || 0
      });
      
      // Notify any listeners that responses have changed
      const event = new CustomEvent('zrveys:surveyResponseSubmitted', { 
        detail: { 
          surveyId,
          timestamp: new Date().toISOString()
        },
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(event);
      console.log('[submitSurveyResponse] Event dispatched:', event);
    } catch (error) {
      console.error('[submitSurveyResponse] Error:', error);
      throw error;
    }
  }

  async deleteDraft(draftId: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Get the draft to verify ownership
      const draftDoc = await getDoc(doc(this.draftsCollection, draftId));
      if (!draftDoc.exists()) {
        throw new Error('Draft not found');
      }

      const draftData = draftDoc.data();
      if (draftData.owner !== currentUser.uid) {
        throw new Error('Not authorized to delete this draft');
      }

      await deleteDoc(doc(this.draftsCollection, draftId));
      console.log(`Deleted draft: ${draftId}`);
    } catch (error) {
      console.error('Error deleting draft:', error);
      throw error;
    }
  }

  async deleteSurvey(surveyId: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Get the survey to verify ownership
      const surveyDoc = await getDoc(doc(this.surveysCollection, surveyId));
      if (!surveyDoc.exists()) {
        throw new Error('Survey not found');
      }

      const surveyData = surveyDoc.data();
      if (surveyData.owner !== currentUser.uid) {
        throw new Error('Not authorized to delete this survey');
      }

      await deleteDoc(doc(this.surveysCollection, surveyId));
      console.log(`Deleted survey: ${surveyId}`);
    } catch (error) {
      console.error('Error deleting survey:', error);
      throw error;
    }
  }

  async deleteAllSurveys(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      console.log('Deleting all surveys...');
      const querySnapshot = await getDocs(
        query(
          this.surveysCollection,
          where('owner', '==', currentUser.uid)
        )
      );

      console.log(`Found ${querySnapshot.docs.length} surveys to delete`);
      
      // Delete each survey
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref);
        console.log(`Deleted survey: ${doc.id}`);
      }

      console.log('All surveys deleted successfully');
    } catch (error) {
      console.error('Error deleting surveys:', error);
      throw error;
    }
  }

  async getAllSurveys(): Promise<SurveyData[]> {
    try {
      const querySnapshot = await getDocs(this.surveysCollection);
      return querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      })) as SurveyData[];
    } catch (error) {
      console.error('Error getting surveys:', error);
      return [];
    }
  }

  async updateSurvey(id: string, data: Partial<SurveyData>): Promise<boolean> {
    try {
      const surveyRef = doc(this.surveysCollection, id);
      await updateDoc(surveyRef, data);
      return true;
    } catch (error) {
      console.error('Error updating survey:', error);
      return false;
    }
  }

  async getCompletedSurveys(): Promise<CompletedSurveyListItem[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    try {
      const querySnapshot = await getDocs(
        query(
          this.surveysCollection,
          where('owner', '==', currentUser.uid),
          where('active', '==', false),
          orderBy('createdAt', 'desc')
        )
      );

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || 'Untitled Survey',
        owner: doc.data().owner,
        completed: doc.data().createdAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error loading completed surveys:', error);
      throw error;
    }
  }

  async addResponse(surveyId: string, response: any): Promise<boolean> {
    try {
      const surveyRef = doc(this.surveysCollection, surveyId);
      await updateDoc(surveyRef, {
        responses: arrayUnion(response)
      });
      return true;
    } catch (error) {
      console.error('Error adding response:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const surveyService = new SurveyService();

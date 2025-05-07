import { QuestionTypeModel } from '../types/survey';
import { db, auth } from '../config/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion, serverTimestamp, QueryDocumentSnapshot, query, where, orderBy } from 'firebase/firestore';

interface SurveyData {
  id: string;
  title: string;
  questions: QuestionTypeModel[];
  respondents: number;
  responses: any[];
  createdAt: string;
  active: boolean;
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

class SurveyService {
  private readonly surveysCollection = collection(db, 'surveys');
  private readonly draftsCollection = collection(db, 'drafts');

  constructor() {
    // Ensure collections exist
    this.initializeCollections();
  }

  private async initializeCollections() {
    try {
      // Try to get a document to ensure collection exists
      const draftRef = doc(this.draftsCollection, 'init');
      await setDoc(draftRef, { initialized: true }, { merge: true });
      console.log('Collections initialized successfully');
    } catch (error) {
      console.error('Error initializing collections:', error);
    }
  }

  async createSurvey(title: string, questions: QuestionTypeModel[], respondents: number): Promise<string> {
    try {
      // Check if we're authenticated
      const currentUser = auth.currentUser;
      console.log('Current user:', currentUser?.uid);
      
      if (!currentUser) {
        console.error('No current user found');
        throw new Error('You must be logged in to create a survey');
      }

      console.log('Starting survey creation...');
      
      // Generate a unique ID for the survey
      const id = crypto.randomUUID();
      console.log('Generated ID:', id);
      
      // Get a reference to the document
      const docRef = doc(this.surveysCollection, id);
      console.log('Document reference created:', docRef.path);
      
      // Create the full survey data
      const surveyData = {
        title: title || 'Untitled Survey',
        questions: questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          type: q.type,
          options: q.options || []
        })),
        respondents: Number(respondents) || 0,
        owner: currentUser.uid,
        active: true,
        responses: [],
        created: new Date().toISOString()
      };
      
      console.log('Attempting to write survey data:', JSON.stringify(surveyData, null, 2));
      
      // Write the document
      await setDoc(docRef, surveyData);
      console.log('Survey data written successfully');
      
      // Verify the document was created
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log('Document verified, data:', docSnap.data());
      } else {
        console.error('Document was not created');
        throw new Error('Failed to verify survey creation');
      }
      
      return id;
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

      console.log('Attempting to save draft:', { 
        draftId, 
        currentUser: {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
        },
        auth: {
          currentUser: auth.currentUser?.uid || 'none'
        }
      });

      // Save the draft
      const draftRef = doc(this.draftsCollection, draftId);
      const draftData = {
        title: survey.title,
        questions: survey.questions,
        owner: currentUser.uid,  // Always set owner to current user
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      console.log('Draft data to save:', JSON.stringify(draftData, null, 2));

      await setDoc(draftRef, draftData);
      console.log('Draft saved successfully');
    } catch (error: any) {
      console.error('Error saving draft:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to save drafts');
      }
      throw error;
    }
  }

  async getSurvey(surveyId: string): Promise<SurveyData | null> {
    try {
      const surveyDoc = await getDoc(doc(this.surveysCollection, surveyId));
      if (surveyDoc.exists()) {
        return surveyDoc.data() as SurveyData;
      }
      return null;
    } catch (error) {
      console.error('Error getting survey:', error);
      throw error;
    }
  }

  async getResponses(surveyId: string): Promise<any[]> {
    try {
      const surveyDoc = await getDoc(doc(this.surveysCollection, surveyId));
      if (surveyDoc.exists()) {
        const data = surveyDoc.data();
        return data.responses || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting responses:', error);
      return [];
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

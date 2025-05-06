import { QuestionTypeModel } from '../types/survey';
import { db, auth } from '../config/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

interface SurveyData {
  id: string;
  title: string;
  questions: QuestionTypeModel[];
  respondents: number;
  responses: any[];
  createdAt: string;
  active: boolean;
}

class SurveyService {
  private readonly surveysCollection = collection(db, 'surveys');

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

  async getSurvey(id: string): Promise<SurveyData | null> {
    try {
      const surveyDoc = await getDoc(doc(this.surveysCollection, id));
      if (surveyDoc.exists()) {
        return surveyDoc.data() as SurveyData;
      }
      return null;
    } catch (error) {
      console.error('Error getting survey:', error);
      throw error;
    }
  }

  async getAllSurveys(): Promise<SurveyData[]> {
    try {
      const querySnapshot = await getDocs(this.surveysCollection);
      return querySnapshot.docs.map(doc => doc.data() as SurveyData);
    } catch (error) {
      console.error('Error getting all surveys:', error);
      throw error;
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

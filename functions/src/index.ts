import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

interface CreateUserData {
  email: string;
  password: string;
}

export const createUserCallable = functions.https.onCall(
  async (request: functions.https.CallableRequest<CreateUserData>) => {
    const { email, password } = request.data;

    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
      });

      return {
        success: true,
        uid: userRecord.uid,
        email: userRecord.email,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
);

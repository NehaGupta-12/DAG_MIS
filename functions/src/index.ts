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

interface ChangePasswordRequest {
  uid: string;
  newPassword: string;
}

export const changePassword = functions.https.onCall(
  async (request: functions.https.CallableRequest<ChangePasswordRequest>) => {
    const { uid, newPassword } = request.data;

    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Only authenticated users can change a password."
      );
    }

    if (!uid || !newPassword) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameters: uid and newPassword."
      );
    }

    try {
      await admin.auth().updateUser(uid, { password: newPassword });
      return { message: `Password for user ${uid} successfully updated.` };
    } catch (error) {
      console.error(`Error updating password for user ${uid}:`, error);
      throw new functions.https.HttpsError("internal", "Failed to update password.");
    }
  }
);
interface DisableUserRequest {
  uid: string;
  disabled: boolean;
}

export const disableUser = functions.https.onCall(
  async (request: functions.https.CallableRequest<DisableUserRequest>, context) => {
    const { uid, disabled } = request.data;

    if (!uid) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing or invalid parameters: uid and disabled'
      );
    }

    try {
      // 🔹 Step 1: Actually disable/enable in Firebase Auth
      await admin.auth().updateUser(uid, { disabled });
      // 🔹 Step 2: Update your Realtime DB for UI
      const status = disabled ? 'Inactive' : 'Active';
      await admin.database().ref(`users/${uid}`).update({ status });

      return {
        message: `Successfully marked user ${uid} as ${status}`,
        status,
      };
    } catch (error: any) {
      console.error('Error disabling user:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error disabling user: ' + error.message
      );
    }
  }
);


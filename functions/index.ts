import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp({
  projectId: 'peup-ciatos'
});

export const createUserAndLinkToCompany = functions.region('us-central1').https.onCall(async (request) => {
  console.log("CREATE_USER_AND_LINK_START");
  try {
    const { nome, email, role, empresa_id } = request.data;
    const auth = request.auth;

    if (!auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    
    const adminUser = await admin.firestore().collection('users').doc(auth.uid).get();
    if (!adminUser.exists || adminUser.data()?.role !== 'ADMIN') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can create users.');
    }

    if (!nome || !email || !role) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }

    const provisionalPassword = Math.random().toString(36).slice(-12);
    
    console.log("DEBUG_AUTH_CREATE_USER_PARAMS", {
      email,
      password: '***',
      displayName: nome
    });
    
    const userRecord = await admin.auth().createUser({
      email,
      password: provisionalPassword,
      displayName: nome,
    });

    await admin.firestore().collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      nome,
      email,
      role,
      empresa_id: empresa_id || null,
      senha: provisionalPassword,
      primeiro_acesso: true
    });

    console.log("USER_CREATED_AND_LINKED", { uid: userRecord.uid, empresa_id });
    return { userId: userRecord.uid, provisionalPassword };
  } catch (error: any) {
    console.error("CREATE_USER_AND_LINK_ERROR", {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw new functions.https.HttpsError('internal', error.message || 'Unknown error');
  }
});

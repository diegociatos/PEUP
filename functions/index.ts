import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const createCompanyWithSocio = functions.https.onCall(async (request) => {
  try {
    const data = request.data;
    const auth = request.auth;
    console.log("CREATE_COMPANY_REQUEST", { data, auth });
    // 1. Check if user is authenticated and is ADMIN
    if (!auth) {
      console.log("CREATE_COMPANY_ERROR: Unauthenticated");
      throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const adminUser = await admin.firestore().collection('users').doc(auth.uid).get();
    console.log("CREATE_COMPANY_ADMIN_CHECK", { uid: auth.uid, exists: adminUser.exists, role: adminUser.data()?.role });
    if (!adminUser.exists || adminUser.data()?.role !== 'ADMIN') {
      console.log("CREATE_COMPANY_ERROR: Permission Denied");
      throw new functions.https.HttpsError('permission-denied', 'Only admins can create companies.');
    }

    const { nome, cnpj, qualificacao, socioNome, socioEmail } = data as { 
      nome: string; 
      cnpj: string; 
      qualificacao: string; 
      socioNome: string; 
      socioEmail: string; 
    };

    if (!nome || !cnpj || !qualificacao || !socioNome || !socioEmail) {
      console.log("CREATE_COMPANY_ERROR: Missing fields", { nome, cnpj, qualificacao, socioNome, socioEmail });
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }

    // 2. Generate provisional password
    const generatePassword = (len=12) => {
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
      let password = "";
      for (let i = 0; i < len; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      return password;
    };
    const provisionalPassword = generatePassword(12);
    console.log("CREATE_COMPANY_PASSWORD_GENERATED");

    // 3. Create user in Auth
    const userRecord = await admin.auth().createUser({
      email: socioEmail,
      password: provisionalPassword,
      displayName: socioNome,
    });
    console.log("CREATE_COMPANY_USER_CREATED", { uid: userRecord.uid });

    const companyId = admin.firestore().collection('companies').doc().id;
    const userId = userRecord.uid;

    // 4. Create documents in Firestore atomically
    const batch = admin.firestore().batch();

    const companyRef = admin.firestore().collection('companies').doc(companyId);
    batch.set(companyRef, {
      id: companyId,
      nome,
      cnpj,
      qualificacao,
      responsavel: socioNome,
      status: 'Ativa',
      dataCadastro: new Date().toISOString().split('T')[0]
    });

    const userRef = admin.firestore().collection('users').doc(userId);
    batch.set(userRef, {
      id: userId,
      nome: socioNome,
      email: socioEmail,
      role: 'SOCIO',
      empresa_id: companyId,
      senha: provisionalPassword, // In a real app, hash this!
      primeiro_acesso: true
    });
    console.log("CREATE_COMPANY_BATCH_COMMITTING");
    await batch.commit();
    console.log("CREATE_COMPANY_BATCH_COMMITTED");

    return { companyId, userId, provisionalPassword };
  } catch (error) {
    console.error("CREATE_COMPANY_CRITICAL_ERROR", error);
    throw error;
  }
});

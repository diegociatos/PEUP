const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // User needs to provide this

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrate() {
  const companies = JSON.parse(localStorage.getItem('peup_companies') || '[]');
  const users = JSON.parse(localStorage.getItem('peup_users') || '[]');

  console.log(`Migrating ${companies.length} companies and ${users.length} users...`);

  for (const company of companies) {
    await db.collection('companies').doc(company.id).set(company);
  }

  for (const user of users) {
    await db.collection('users').doc(user.id).set(user);
  }

  console.log('Migration complete.');
}

// migrate(); // Commented out to prevent accidental execution

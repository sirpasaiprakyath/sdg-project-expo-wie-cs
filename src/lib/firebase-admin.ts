import * as admin from 'firebase-admin';

const serviceAccountKey: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || "sdg-hack-cs-wie",
  privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDPHJnj3cYz6rVw\nWeWN1zFbjaLK+/9/U47hMkMmNePBFRguU8Z1i+pDr4zlbjsQqqTZFOzp21sMzflB\na0iYRsNGWtLeKwwu2Fd2xOXWMo59qIQE2KqFAsIrwDb8DcewDLtRy+RRlEt2hUTt\ndma8aPNOcr59dm7llWZQPd4loZXaHC6aQktU1mQcQR5OJ07QlCWCasb8ys6b263V\nv51LI7k0DP8zniA9YXPUH21w7LFc4naT1aXaSWLA7EyUCsuvayQcsKpdDzxxrtpS\nEkgIUqwRroE2HS0mHwlhQBOaFqaRnRQ+SHNy92RnLLeZFuSSI6ddgbUtYCgM3/9z\nwNAnP3tZAgMBAAECggEALozVIdwU0lJsmWX7LFgzpco9zrW5BVs4f/EWGp5+JEWj\ne7YkowLhknkAiAiwidxw1MHZRe6hlk0tOsDsPh2ZglSjlH/EazsA3Zb/uZb/Y8re\ncWBpYx/tmHvJX/mQ6kbSS14yYQudsnPdvCmiibJlDTrJCdX2su9TYbGmHnsk/TJ0\nrjNp23/Ms3+p98YmXm3f+xtzip5JzomEkSQPazsiqBiHz02X4PgbkDQKqPtelieU\nAeZhKVwq5rs0r5chV20lpFyJXsoEwEQW/sYGzCdqOiNhxvPVdqwH6QNU4nBqL8Cv\n2kij6YV5tLxTUh1fBqMCEQ2zLYci2Mh0tJuUtf64aQKBgQD0V8Srz1MZsEcfsHro\nNfeNes3jb0mVD7jwWdPrJxyuIp6vIeern6/nq0gQOl3HPJokdBeVE6p5grr0hlxC\nEdnicRa2BZFZEjl3T6OQgSILo9SgXWN3zPuoaozbkMQZ4t3G0pIquzQhmhePHMrr\n/Pz4enjlxaZz+bEl4jdsjHd96wKBgQDY/h4+UcwkX3T7Lz34D260cg4EpGEQudsD\nX3oX/zVGT48ySJuIEj2d82OIOhpo72iTBzIkYmwWwvhiVAmFOeemGPweV6QzWS/z\nfNX+S1TN3eu+82Rv9eATQllMlT1V7yzeoICc3dWgit3AVwXpbXSrjIX5KgXRsOWN\nUtOTnTlmywKBgFnHJew68T2vF3L9VSudKKhDRwMaEN9EN5+YYdU1OcSB0+xleMoG\nkot8062ixHJAQiLCxSdxYmHjNu5BsARWqsgY5U9cHFut5o+AI4kk6W19dNK3faS3\nHIB1JexG9MbOJM648BvjTPRLufxLiAPNoOVrmqBSTyatx/kzdUndEsqhAoGAPKTo\ntuoNb6zt+LV/UDCf8/ZcTJfUOOR4fTzV1pcQwJHDp337WdAfQGGhU5VJhEJEq7K7\nJMgNBV+AI5rw/jbsstMQwzojPeaTLC2bcPKExPRcyoUjcNb6xOcqJekft0Cc/atF\nxpGI/tFQoEyx7kcU8EzZtIU2EyCpRxH656ptPHkCgYBEmciN6BHkDYU+qeM4Fqqp\noP0d1O5G7TUTrsx4haR2mePGB3QEUPyjjwaRd9e462cM05tWVbT7irI6T4up4ANx\ngPRw7siMOjgz8o6wdO0NR7Cn/++JcaAH3JfU4lwkuekd/AtAbluFGsqe/YvSsc8Y\nP0s9r2Ocl+Fvpwb/5BevRg==\n-----END PRIVATE KEY-----\n`).replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@sdg-hack-cs-wie.iam.gserviceaccount.com",
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;

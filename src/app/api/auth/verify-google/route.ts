import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { idToken, email } = await request.json();

    if (!email || !email.toLowerCase().endsWith('@klu.ac.in')) {
      return NextResponse.json(
        { error: 'Access Denied: Only institutional accounts belonging to @klu.ac.in are allowed.' },
        { status: 403 }
      );
    }

    if (idToken && adminAuth) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken.email?.toLowerCase().endsWith('@klu.ac.in')) {
          return NextResponse.json(
            { error: 'Server Verification Error: Email domain must be @klu.ac.in' },
            { status: 403 }
          );
        }
      } catch (err) {
        console.error('ID Token verification failed:', err);
      }
    }

    // Lookup in Firestore teams collection if initialized
    if (adminDb) {
      const teamsRef = adminDb.collection('teams');
      const snapshot = await teamsRef.get();
      let matchedTeam: any = null;
      let matchedMember: any = null;

      snapshot.forEach((doc) => {
        const teamData = doc.data();
        if (teamData.members && Array.isArray(teamData.members)) {
          const member = teamData.members.find(
            (m: any) => m.email?.toLowerCase() === email.toLowerCase()
          );
          if (member) {
            matchedTeam = { id: doc.id, ...teamData };
            matchedMember = member;
          }
        }
      });

      if (!matchedTeam) {
        return NextResponse.json({
          verified: true,
          assigned: false,
          message:
            'Your KLU account is authenticated, but you are not assigned to a registered team. Please contact the event coordinators.',
        });
      }

      return NextResponse.json({
        verified: true,
        assigned: true,
        team: matchedTeam,
        member: matchedMember,
      });
    }

    return NextResponse.json({
      verified: true,
      assigned: true,
      email,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

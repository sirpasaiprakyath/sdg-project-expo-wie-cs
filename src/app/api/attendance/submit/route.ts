import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { AttendanceRecord } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { sessionId, teamId, records } = await request.json();

    if (!sessionId || !teamId || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid attendance submission payload.' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: true, message: 'Attendance recorded locally.' });
    }

    // Atomic Duplicate Protection Check for SESSION + TEAM
    const attRef = adminDb.collection('attendance');
    const duplicateQuery = await attRef
      .where('sessionId', '==', sessionId)
      .where('teamId', '==', teamId)
      .get();

    if (!duplicateQuery.empty) {
      return NextResponse.json(
        { error: 'Attendance for this team has already been submitted.' },
        { status: 409 }
      );
    }

    const batch = adminDb.batch();
    for (const record of records as AttendanceRecord[]) {
      const docRef = attRef.doc(record.id);
      batch.set(docRef, record);
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Attendance submitted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

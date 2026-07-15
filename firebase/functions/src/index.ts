import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

admin.initializeApp();

const db = admin.firestore();
const corsHandler = cors({ origin: true });

export const onPatientCreated = functions.firestore
  .document('patients/{patientId}')
  .onCreate(async (snap, context) => {
    const patient = snap.data();
    const patientId = context.params.patientId;

    await db.collection('activity').add({
      type: 'patient_created',
      description: `Patient ${patient.name} was registered`,
      patientId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

export const onVisitCreated = functions.firestore
  .document('visits/{visitId}')
  .onCreate(async (snap, context) => {
    const visit = snap.data();
    const visitId = context.params.visitId;

    if (visit.is_emergency) {
      const payload = {
        notification: {
          title: '🚨 Emergency Case Alert',
          body: `${visit.patient_name} requires immediate attention - ${visit.risk_level}`,
        },
        topic: 'emergency_alerts',
      };
      try {
        await admin.messaging().send(payload);
      } catch (error) {
        functions.logger.error('Failed to send emergency notification', error);
      }

      await db.collection('activity').add({
        type: 'emergency_alert',
        description: `Emergency case: ${visit.patient_name} - Risk Level: ${visit.risk_level}`,
        patientId: visit.patient_id,
        visitId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await db.collection('activity').add({
      type: 'visit_created',
      description: `Visit recorded for ${visit.patient_name} (${visit.visit_type})`,
      patientId: visit.patient_id,
      visitId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('patients').doc(visit.patient_id).update({
      lastVisit: visit.visit_date,
      lastVisitType: visit.visit_type,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

export const onReminderDue = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const snapshot = await db.collection('reminders')
      .where('status', '==', 'pending')
      .where('scheduled_date', '==', dateStr)
      .where('scheduled_time', '<=', timeStr)
      .limit(50)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'overdue',
        overdueAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();

    functions.logger.info(`Marked ${snapshot.docs.length} reminders as overdue`);
    return null;
  });

export const generateDailySummary = functions.pubsub
  .schedule('0 22 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const today = new Date().toISOString().split('T')[0];

    const patientsSnap = await db.collection('patients').count().get();
    const visitsSnap = await db.collection('visits')
      .where('visit_date', '>=', today)
      .count()
      .get();
    const remindersSnap = await db.collection('reminders')
      .where('status', '==', 'pending')
      .count()
      .get();
    const emergencySnap = await db.collection('visits')
      .where('is_emergency', '==', true)
      .where('visit_date', '>=', today)
      .count()
      .get();

    const summary = {
      date: today,
      totalPatients: patientsSnap.data().count,
      todayVisits: visitsSnap.data().count,
      pendingReminders: remindersSnap.data().count,
      emergencyCases: emergencySnap.data().count,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('daily_summaries').doc(today).set(summary);
    functions.logger.info('Daily summary generated', summary);
    return null;
  });

export const cleanupOldActivity = functions.pubsub
  .schedule('0 3 * * 0')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await db.collection('activity')
      .where('timestamp', '<', thirtyDaysAgo)
      .limit(500)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    functions.logger.info(`Cleaned up ${snapshot.docs.length} old activity records`);
    return null;
  });

export const sendReminderNotifications = functions.pubsub
  .schedule('every 30 minutes')
  .onRun(async (context) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const snapshot = await db.collection('reminders')
      .where('status', '==', 'pending')
      .where('scheduled_date', '==', dateStr)
      .where('scheduled_time', '>=', timeStr)
      .where('scheduled_time', '<=', timeStr)
      .limit(50)
      .get();

    if (snapshot.empty) return null;

    const tokens: string[] = [];
    snapshot.docs.forEach((doc) => {
      const reminder = doc.data();
      if (reminder.fcmToken) {
        tokens.push(reminder.fcmToken);
      }
    });

    if (tokens.length > 0) {
      const message = {
        tokens,
        notification: {
          title: 'MedAssist Reminder',
          body: `You have ${snapshot.docs.length} pending reminder(s)`,
        },
      };

      try {
        await admin.messaging().sendEachForMulticast(message);
      } catch (error) {
        functions.logger.error('Failed to send reminder notifications', error);
      }
    }

    return null;
  });

export const api = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      switch (req.method) {
        case 'GET':
          if (req.path === '/stats') {
            const patientsSnap = await db.collection('patients').count().get();
            const visitsSnap = await db.collection('visits').count().get();
            res.json({
              totalPatients: patientsSnap.data().count,
              totalVisits: visitsSnap.data().count,
            });
          } else {
            res.status(404).json({ error: 'Not found' });
          }
          break;

        case 'POST':
          if (req.path === '/activity') {
            const { type, description, patientId } = req.body;
            const doc = await db.collection('activity').add({
              type,
              description,
              patientId,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
            res.json({ id: doc.id, success: true });
          } else {
            res.status(404).json({ error: 'Not found' });
          }
          break;

        default:
          res.status(405).json({ error: 'Method not allowed' });
      }
    } catch (error: any) {
      functions.logger.error('API error', error);
      res.status(500).json({ error: error.message });
    }
  });
});

import AdminDashboardShell from "../../components/admin/dashboard-shell";
import { getAstraDb } from "../../lib/db";
import { QuestionnaireData } from "../../types/kuesioner";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch kuesioner count from DB (server-side)
  let kuesionerCount: number | null = null;
  let questionnaires: QuestionnaireData[] = [];
  try {
    const db = await getAstraDb();
    const formsCollection = db.collection<QuestionnaireData>("form");
    const cursor = formsCollection.find({}).sort({ submittedAt: -1 });
    const collected: QuestionnaireData[] = [];
    for await (const doc of cursor) {
      collected.push(doc as QuestionnaireData);
    }

    questionnaires = collected;
    kuesionerCount = collected.length;
  } catch (err) {
    // keep null to indicate error; page will render fallback
    console.error("Failed to fetch kuesioner data:", err);
    kuesionerCount = null;
    questionnaires = [];
  }

  return (
    <AdminDashboardShell
      respondentCount={kuesionerCount}
      questionnaires={questionnaires}
    />
  );
}

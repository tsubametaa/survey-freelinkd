import AdminDashboardShell from "../../components/admin/dashboard-shell";
import { getMongoDb } from "../../lib/db";
import { QuestionnaireData } from "../../types/kuesioner";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch kuesioner count from DB (server-side)
  let kuesionerCount: number | null = null;
  let questionnaires: QuestionnaireData[] = [];
  try {
    const db = await getMongoDb();
    kuesionerCount = await db.collection("kuesioner").countDocuments();
    questionnaires = (await db
      .collection("kuesioner")
      .find({})
      .sort({ submittedAt: -1 })
      .toArray()) as unknown as QuestionnaireData[];
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

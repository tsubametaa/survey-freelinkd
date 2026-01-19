import { NextRequest } from "next/server";
import { getAstraDb } from "../../../lib/db";
import { QuestionnaireData, Answer } from "../../../types/kuesioner";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = await getAstraDb();
    const formsCollection = db.collection<QuestionnaireData>("form");

    // fetch all data, sort by submittedAt desc
    const cursor = formsCollection.find({}).sort({ submittedAt: -1 });

    const collected: QuestionnaireData[] = [];
    for await (const doc of cursor) {
      collected.push(doc as QuestionnaireData);
    }

    // Prepare CSV headers
    const headers = [
      "No",
      "Nama Lengkap",
      "Jenis Kelamin",
      "Usia",
      "Peran",
      "Tanggal Submit",
      "QA Umum - Pertanyaan 1",
      "QA Umum - Pertanyaan 2",
      "QA Umum - Pertanyaan 3",
      "Role Specific - Pertanyaan 1",
      "Role Specific - Pertanyaan 2",
      "Role Specific - Pertanyaan 3",
      "Role Specific - Pertanyaan 4",
      "Role Specific - Pertanyaan 5",
      "Role Specific - Pertanyaan 6",
      "Role Specific - Pertanyaan 7",
      "Role Specific - Pertanyaan 8",
      "Role Specific - Pertanyaan 9",
      "Role Specific - Pertanyaan 10",
      "QA End - Pertanyaan 1",
      "QA End - Pertanyaan 2",
      "QA End - Pertanyaan 3",
    ];

    // Prepare CSV rows
    const rows = collected.map((q, index) => {
      const qaUmumAnswers = q.qaUmum?.answers || [];
      const roleSpecificAnswers = q.roleSpecific?.answers || [];
      const qaEndAnswers = q.qaEnd?.answers || [];

      const getAnswer = (arr: Answer[], id: number) =>
        arr.find((a) => a.questionId === id)?.answer ??
        arr.find((a) => a.questionId === id)?.rating ??
        "";

      return [
        index + 1,
        q.intro?.fullName || "",
        q.intro?.gender || "",
        q.intro?.age ?? "",
        q.userRole || "",
        q.submittedAt
          ? new Date(q.submittedAt).toLocaleDateString("id-ID")
          : "",
        getAnswer(qaUmumAnswers, 1),
        getAnswer(qaUmumAnswers, 2),
        getAnswer(qaUmumAnswers, 3),
        getAnswer(roleSpecificAnswers, 1),
        getAnswer(roleSpecificAnswers, 2),
        getAnswer(roleSpecificAnswers, 3),
        getAnswer(roleSpecificAnswers, 4),
        getAnswer(roleSpecificAnswers, 5),
        getAnswer(roleSpecificAnswers, 6),
        getAnswer(roleSpecificAnswers, 7),
        getAnswer(roleSpecificAnswers, 8),
        getAnswer(roleSpecificAnswers, 9),
        getAnswer(roleSpecificAnswers, 10),
        getAnswer(qaEndAnswers, 1),
        getAnswer(qaEndAnswers, 2),
        getAnswer(qaEndAnswers, 3),
      ];
    });

    // Helper to format CSV cells: keep pure numbers unquoted so Excel treats them as numbers
    const formatCell = (cell: unknown) => {
      if (cell === null || cell === undefined) return "";
      // If already a number, return raw
      if (typeof cell === "number") return String(cell);
      // If string that looks like a number (integer or float), return raw
      if (typeof cell === "string" && /^-?\d+(?:[.,]\d+)?$/.test(cell.trim())) {
        // replace comma decimal with dot for CSV numeric value
        return cell.trim().replace(",", ".");
      }
      // Otherwise escape quotes and wrap in quotes
      const escaped = String(cell).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => formatCell(cell)).join(","))
      .join("\n");

    // Create response with CSV content
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv;charset=utf-8;",
        "Content-Disposition": `attachment; filename="data-kuesioner-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error generating CSV:", error);
    return new Response("Error generating CSV file", {
      status: 500,
      headers: { "Content-Type": "text/plain" }
    });
  }
}
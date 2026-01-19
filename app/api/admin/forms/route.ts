import { NextResponse } from "next/server";
import { getAstraDb } from "@/app/lib/db";
import { QuestionnaireData } from "@/app/types/kuesioner";

/**
 * GET /api/admin/forms
 *
 * Fetches ALL questionnaire data from the Astra DB 'form' collection
 * without any pagination limit. Uses batch iteration to overcome
 * Astra DB's default 20 document limit per query.
 */
export async function GET() {
  try {
    console.log("🔌 Connecting to Astra DB for forms fetch...");

    const db = await getAstraDb();
    const formsCollection = db.collection<QuestionnaireData>("form");

    console.log("✅ Astra DB connected, fetching all forms...");

    // Astra DB has a default limit of 20 documents per query
    // We need to iterate through all documents using pagination
    const allForms: QuestionnaireData[] = [];
    const batchSize = 20; // Astra DB default page size
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      console.log(`📄 Fetching batch starting from ${skip}...`);

      const cursor = formsCollection
        .find({})
        .sort({ submittedAt: -1 }) // Most recent first
        .skip(skip)
        .limit(batchSize);

      const batch: QuestionnaireData[] = [];
      for await (const doc of cursor) {
        batch.push(doc as QuestionnaireData);
      }

      if (batch.length === 0) {
        hasMore = false;
      } else {
        allForms.push(...batch);
        skip += batchSize;

        // If we got less than the batch size, we've reached the end
        if (batch.length < batchSize) {
          hasMore = false;
        }
      }
    }

    console.log(
      `📊 Successfully fetched ${allForms.length} forms from database`,
    );

    return NextResponse.json({
      success: true,
      data: allForms,
      totalCount: allForms.length,
      message: `Successfully fetched all ${allForms.length} questionnaire records`,
    });
  } catch (error) {
    console.error("❌ Error fetching forms:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch questionnaire data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

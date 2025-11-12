import { NextRequest, NextResponse } from "next/server";
import clientPromise, { mongoDbName } from "../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const client = await clientPromise;
    const db = client.db(mongoDbName);
    const collection = db.collection("kuesioner");

    const result = await collection.insertOne({
      ...data,
      submittedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Questionnaire submitted successfully",
        data: {
          id: result.insertedId.toString(),
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting questionnaire:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit questionnaire",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

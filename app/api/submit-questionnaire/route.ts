import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { MongoServerSelectionError } from "mongodb";
import { getMongoDb } from "../../lib/db";
import type { Answer, QuestionnaireData } from "../../types/kuesioner";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Increased from 15 to 30 seconds
export const runtime = "nodejs";

type IncomingQuestionnaire = Partial<Omit<QuestionnaireData, "submittedAt">>;

function sanitizeAnswers(rawAnswers: unknown): Answer[] {
  if (!Array.isArray(rawAnswers)) {
    return [];
  }

  return rawAnswers
    .filter((entry): entry is Answer => {
      if (!entry || typeof entry !== "object") return false;
      const candidate = entry as Record<string, unknown>;
      return typeof candidate.questionId === "number";
    })
    .map((entry) => {
      const base: Answer = { questionId: entry.questionId };

      if (typeof entry.answer === "string") {
        base.answer = entry.answer.trim();
      } else if (typeof entry.answer === "number") {
        base.answer = entry.answer;
      }

      if (typeof entry.rating === "number") {
        base.rating = entry.rating;
      }

      return base;
    });
}

function validatePayload(data: IncomingQuestionnaire) {
  if (!data.intro) {
    throw new Error("Informasi intro tidak ditemukan.");
  }

  const { fullName, gender, age } = data.intro;

  if (!fullName || typeof fullName !== "string") {
    throw new Error("Nama lengkap wajib diisi.");
  }

  if (!gender || typeof gender !== "string") {
    throw new Error("Jenis kelamin wajib diisi.");
  }

  if (!age || typeof age !== "string") {
    throw new Error("Usia wajib diisi.");
  }

  if (!data.userRole || typeof data.userRole !== "string") {
    throw new Error("Peran responden wajib diisi.");
  }

  if (!data.qaUmum || !Array.isArray(data.qaUmum.answers)) {
    throw new Error("Jawaban kuesioner umum tidak valid.");
  }

  if (!data.qaEnd || !Array.isArray(data.qaEnd.answers)) {
    throw new Error("Jawaban kuesioner penutup tidak valid.");
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Receiving questionnaire submission...");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Timestamp:", new Date().toISOString());

    const payload = (await request.json()) as IncomingQuestionnaire;
    console.log("✅ Payload parsed successfully");

    validatePayload(payload);
    console.log("✅ Payload validated successfully");

    const document: QuestionnaireData = {
      intro: {
        fullName: payload.intro!.fullName.trim(),
        gender: payload.intro!.gender.trim(),
        age: payload.intro!.age.trim(),
      },
      userRole: payload.userRole!,
      qaUmum: {
        answers: sanitizeAnswers(payload.qaUmum?.answers),
      },
      roleSpecific: {
        answers: sanitizeAnswers(payload.roleSpecific?.answers),
      },
      qaEnd: {
        answers: sanitizeAnswers(payload.qaEnd?.answers),
      },
      submittedAt: new Date(),
    };

    console.log("🔌 Connecting to MongoDB...");

    // Use the improved getMongoDb with built-in retry logic
    const db = await getMongoDb();
    console.log("✅ MongoDB connected successfully");

    console.log("💾 Inserting document...");

    // Insert with timeout protection
    const insertPromise = db.collection("kuesioner").insertOne(document);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Insert operation timed out after 10 seconds")),
        10000
      )
    );

    const result = await Promise.race([insertPromise, timeoutPromise]);
    console.log("✅ Document inserted with ID:", result.insertedId.toString());

    try {
      revalidatePath("/site/admin");
      console.log("Admin path revalidated");
    } catch (revalidateError) {
      console.warn("Failed to revalidate admin dashboard:", revalidateError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Questionnaire submitted successfully",
        data: {
          id: result.insertedId.toString(),
          timestamp:
            document.submittedAt instanceof Date
              ? document.submittedAt.toISOString()
              : new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting questionnaire:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    let errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    if (error instanceof MongoServerSelectionError) {
      errorMessage =
        "Tidak dapat terhubung ke database. Silakan coba lagi dalam beberapa saat.";
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit questionnaire",
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}

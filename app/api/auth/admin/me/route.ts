import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "../../../../lib/db";
import { User } from "../../../../types/user";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const db = await getMongoDb();
    const usersCollection = db.collection<User>("users");

    // Find user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user data (without password)
    const userWithoutPassword = {
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };

    return NextResponse.json({ user: userWithoutPassword }, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

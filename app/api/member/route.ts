import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToMongoDB } from "@/lib/mongodb";
import User from "@/models/userModel";
import Member from "@/models/memberModel";
import mongoose from "mongoose";

interface JwtPayload {
  id: string;
  email: string;
}

export const runtime = 'nodejs';

export const POST = async (req: Request) => {
  try {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    const token = authHeader
      ? authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader
      : undefined;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB();

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userId = decodedToken.id;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, imageUrl, relation, linkedTo, displayRelation } = body as {
      name?: string;
      imageUrl?: string;
      relation?: string;
      linkedTo?: string | null;
      displayRelation?: string;
    };

    if (!name || !imageUrl || !relation) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Validate linkedTo when provided
    let parentRef: mongoose.Types.ObjectId | undefined = undefined;
    let parentRelation: string | undefined = undefined;
    if (linkedTo) {
      if (!mongoose.Types.ObjectId.isValid(linkedTo)) {
        return NextResponse.json({ message: "Invalid linkedTo id" }, { status: 400 });
      }
      parentRef = new mongoose.Types.ObjectId(linkedTo);
      const parentDoc = await Member.findById(parentRef).select('relation').lean<{ relation?: string }>();
      if (!parentDoc) {
        return NextResponse.json({ message: "Parent member not found" }, { status: 404 });
      }
      parentRelation = parentDoc.relation;
    }

    const member = await Member.create({
      userId,
      name,
      imageUrl,
      relation,
      displayRelation: displayRelation?.trim() || undefined,
      linkedTo: parentRef,
    });

    // Update relationship arrays on the clicked member and optionally mirror to User
    if (parentRef) {
      const fieldMap: Record<string, 'fathers' | 'mothers' | 'wives' | 'sons' | 'daughters' | undefined> = {
        father: 'fathers',
        mother: 'mothers',
        wife: 'wives',
        son: 'sons',
        daughter: 'daughters',
      };
      const field = fieldMap[relation as keyof typeof fieldMap];
      if (field) {
        await Member.findByIdAndUpdate(
          parentRef,
          { $addToSet: { [field]: member._id }, $set: { updatedAt: new Date() } },
          { new: true }
        );
        // If the clicked member is the root (self), mirror update on the User doc as well
        if (parentRelation === 'self') {
          await User.findByIdAndUpdate(
            userId,
            { $addToSet: { [field]: member._id } },
          );
        }
      }
    }

    return NextResponse.json({ message: "Member added successfully", member }, { status: 200 });
  } catch (err: unknown) {
    console.log(err);
    const name = typeof err === 'object' && err !== null && 'name' in err ? (err as { name?: string }).name : undefined;
    if (name === "TokenExpiredError" || name === "JsonWebTokenError" || name === "NotBeforeError") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
};

export const GET = async (req: Request) => {
  try {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    const token = authHeader
      ? authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader
      : undefined;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB();
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userId = decodedToken.id;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const docs = await Member.find({ userId })
      .select("name imageUrl relation displayRelation linkedTo createdAt updatedAt")
      .lean<{ _id: mongoose.Types.ObjectId; name: string; imageUrl: string; relation: string; displayRelation?: string; linkedTo?: mongoose.Types.ObjectId | null; createdAt: Date; updatedAt: Date; }[]>();

    const members = docs.map((d) => ({
      _id: d._id.toString(),
      name: d.name,
      imageUrl: d.imageUrl,
      relation: d.relation,
      displayRelation: d.displayRelation,
      linkedTo: d.linkedTo ? d.linkedTo.toString() : null,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    return NextResponse.json({ members }, { status: 200 });
  } catch (err: unknown) {
    console.log(err);
    const name = typeof err === 'object' && err !== null && 'name' in err ? (err as { name?: string }).name : undefined;
    if (name === "TokenExpiredError" || name === "JsonWebTokenError" || name === "NotBeforeError") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
};

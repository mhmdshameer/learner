import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToMongoDB } from "@/lib/mongodb";
import User from "@/models/userModel";
import Member from "@/models/memberModel";
import mongoose, { Document, Types } from "mongoose";

interface IMemberDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  imageUrl?: string;
  relation: string;
  displayRelation?: string;
  linkedTo?: Types.ObjectId;
  fathers: Types.ObjectId[];
  mothers: Types.ObjectId[];
  wives: Types.ObjectId[];
  husbands: Types.ObjectId[];
  sons: Types.ObjectId[];
  daughters: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

interface IMemberResponse {
  _id: string;
  name: string;
  imageUrl?: string;
  relation: string;
  displayRelation?: string;
  linkedTo: string | null;
  fathers: string[];
  mothers: string[];
  wives: string[];
  husbands: string[];
  sons: string[];
  daughters: string[];
  createdAt: Date;
  updatedAt: Date;
}

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
      const fieldMap: Record<string, { parentField: 'fathers' | 'mothers' | 'wives' | 'sons' | 'daughters', childField: 'sons' | 'daughters' | 'husbands' | 'fathers' | 'mothers' } | undefined> = {
        father: { parentField: 'fathers', childField: 'sons' },
        mother: { parentField: 'mothers', childField: 'daughters' },
        wife: { parentField: 'wives', childField: 'husbands' },
        son: { parentField: 'sons', childField: 'fathers' },
        daughter: { parentField: 'daughters', childField: 'mothers' },
      };
      
      const relationship = fieldMap[relation as keyof typeof fieldMap];
      if (relationship) {
        const { parentField, childField } = relationship;
        
        // Update parent's relationship array (e.g., add to father's sons array)
        await Member.findByIdAndUpdate(
          parentRef,
          { $addToSet: { [parentField]: member._id }, $set: { updatedAt: new Date() } },
          { new: true }
        );
        
        // Update child's relationship array (e.g., add to son's fathers array)
        await Member.findByIdAndUpdate(
          member._id,
          { $addToSet: { [childField]: parentRef }, $set: { updatedAt: new Date() } },
          { new: true }
        );
        
        // If the clicked member is the root (self), mirror update on the User doc as well
        if (parentRelation === 'self') {
          await User.findByIdAndUpdate(
            userId,
            { $addToSet: { [parentField]: member._id } },
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

    // Get member IDs from query params if provided
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');

    // Define the base query with user ID
    const baseQuery = { userId };
    
    // If specific IDs are provided, fetch only those members
    const query = ids 
      ? { 
          ...baseQuery, 
          _id: { 
            $in: ids.split(',').filter((id: string) => 
              mongoose.Types.ObjectId.isValid(id)
            ) 
          } 
        }
      : baseQuery;

    const docs = await Member.find(query)
      .select("name imageUrl relation displayRelation linkedTo fathers mothers wives husbands sons daughters createdAt updatedAt")
      .lean();

    // Cast the lean documents to our interface and map to response
    const members = (docs as unknown as IMemberDocument[]).map((doc): IMemberResponse => ({
      _id: doc._id.toString(),
      name: doc.name,
      imageUrl: doc.imageUrl,
      relation: doc.relation,
      displayRelation: doc.displayRelation,
      linkedTo: doc.linkedTo ? doc.linkedTo.toString() : null,
      fathers: (doc.fathers || []).map(id => id.toString()),
      mothers: (doc.mothers || []).map(id => id.toString()),
      wives: (doc.wives || []).map(id => id.toString()),
      husbands: (doc.husbands || []).map(id => id.toString()),
      sons: (doc.sons || []).map(id => id.toString()),
      daughters: (doc.daughters || []).map(id => id.toString()),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
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

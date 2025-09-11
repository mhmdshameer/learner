import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToMongoDB } from "@/lib/mongodb";
import User from "@/models/userModel";
import Member from "@/models/memberModel";

interface JwtPayload {
  id: string;
  email: string;
}

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

    let root = await Member.findOne({ userId, relation: "self" });
    if (!root) {
      root = await Member.create({
        userId,
        name: user.name,
        imageUrl: user.imageUrl,
        relation: "self",
        linkedTo: null,
      });
    }

    return NextResponse.json({ root: {
      _id: root._id.toString(),
      name: root.name,
      imageUrl: root.imageUrl,
      relation: root.relation,
      linkedTo: root.linkedTo,
    } }, { status: 200 });
  } catch (err) {
    console.log(err);
    const name = typeof err === 'object' && err !== null && 'name' in err ? (err as { name?: string }).name : undefined;
    if (name === "TokenExpiredError" || name === "JsonWebTokenError" || name === "NotBeforeError") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
};

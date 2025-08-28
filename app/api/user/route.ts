import User from "@/models/userModel";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToMongoDB } from "@/lib/mongodb";

interface JwtPayload {
    id: string;
    email: string;
}

export const GET = async (req: Request) => {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if(!token){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }
        await connectToMongoDB();
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const userId = decodedToken.id;
        const user = await User.findById(userId);
        if(!user){
            return NextResponse.json({message: "User not found"}, {status: 404});
        }
        return NextResponse.json({message: "User found", user}, {status: 200});
    } catch (error) {
        console.log(error)
        return NextResponse.json({message: "Internal server error"}, {status: 500});
    }
}
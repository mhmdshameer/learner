import { connectToMongoDB } from "@/lib/mongodb"
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request){
    try {
        const {email, password} = await req.json();
        await connectToMongoDB();

        const user = await User.findOne({email});
        if(!user){
            return NextResponse.json({message: "User not found"}, {status: 404});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return NextResponse.json({message: "Invalid credentials"}, {status: 400});
        }

        const token = jwt.sign({email: user.email}, process.env.JWT_SECRET!, {expiresIn: "1h"});

        return NextResponse.json({message: "Login successful", token}, {status: 200});
    } catch (error) {
        console.log(error)
    }
}
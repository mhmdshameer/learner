import { connectToMongoDB } from "@/lib/mongodb";
import User from "@/models/userModel";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request){
    try {
        const {name, email, password} = await req.json();
        await connectToMongoDB();

        const userExists = await User.findOne({email});
        if(userExists){
            return NextResponse.json({message: "User already exists"}, {status: 400});
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({name, email, password: hashedPassword});

        return NextResponse.json({message: "User created successfully", user: newUser}, {status: 201});
    } catch (error) {
        console.log("Signup error: ", error);
        return NextResponse.json({message: "Signup failed"}, {status: 500});
    }
}
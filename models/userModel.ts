import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    imageUrl: {
        type: String,
        required: [true, "Image URL is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    // Relationship arrays pointing to Member documents
    fathers: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    mothers: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    wives: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    husbands: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    sons: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    daughters: [{ type: Schema.Types.ObjectId, ref: "Member" }],
})

const User = models.User || model("User", userSchema);
export default User;
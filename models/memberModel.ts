import { Schema, model, models } from "mongoose";

const memberSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User"},     // Reference to User (owner of the tree)
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    photo: {
        type: String,
        required: [true, "Image URL is required"],
    },
    relation: {
        type: String,
        required: [true, "Relation is required"],
    },     // Enum: 'Father', 'Mother', 'Wife', etc.
    linkedTo: {type: Schema.Types.ObjectId, ref: "User"},   // Reference to main User or another member (to allow branching)
    children: [{type: Schema.Types.ObjectId, ref: "User"}], // Array of FamilyMember references
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
  })

const Member = models.Member || model("Member", memberSchema);
export default Member;

import { Schema, model, models } from "mongoose";

const memberSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User"},     // Reference to User (owner of the tree)
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    imageUrl: {
        type: String,
        required: [true, "Image URL is required"],
    },
    relation: {
        type: String,
        required: [true, "Relation is required"],
    },     // Enum: 'father', 'mother', 'wife', 'son', 'daughter', 'self', etc.
    displayRelation: {
        type: String,
        required: false, // Optional custom label shown on the card relative to the root user
        default: undefined,
    },
    linkedTo: {type: Schema.Types.ObjectId, ref: "Member"},
    // Relationship arrays pointing to other Member documents
    fathers: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    mothers: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    wives: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    sons: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    daughters: [{ type: Schema.Types.ObjectId, ref: "Member" }],
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

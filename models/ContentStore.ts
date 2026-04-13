import { Schema, model, models } from "mongoose";

const contentStoreSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ContentStore =
  models.ContentStore ?? model("ContentStore", contentStoreSchema);

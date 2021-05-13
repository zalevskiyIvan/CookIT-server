const { Schema, model, Types } = require("mongoose");

// type categoryType =
//   | "firstD"
//   | "secondD"
//   | "deserts"
//   | "snacks"
//   | "salats"
//   | "drinks"
//   | "souses"
//   | "backery"
//   | "sideD";

const stepSchema = new Schema({
  id: Number,
  img: String,
  stepDescription: String,
});

const recipeschema = new Schema({
  header: String,
  recipe: [stepSchema],
  description: String,
  likesCount: Number,
  category: String,
  cook: { type: Types.ObjectId, ref: "users" },
  ingredients: String,
  img: String,
  comments: [{ type: Types.ObjectId, ref: "comments" }],
});

exports.recipeschema = model("recipes", recipeschema);

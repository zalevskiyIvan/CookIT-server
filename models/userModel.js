const { Schema, model, Types } = require("mongoose");

const fullInfo = new Schema({
  gender: String,
  birthday: String,
  country: String,
  city: String,
});

const userSchema = new Schema({
  username: { type: String, require: true, unique: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  recipes: [{ type: Types.ObjectId, ref: "recipes" }],
  followers: [{ type: Types.ObjectId, ref: "users" }],
  subscriptions: [{ type: Types.ObjectId, ref: "users" }],
  bookmarks: [{ type: Types.ObjectId, ref: "recipes" }],
  description: String,
  fullInfo: fullInfo,
  avatar: String,
});

exports.UserSchema = model("users", userSchema);

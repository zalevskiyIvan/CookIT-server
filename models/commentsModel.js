const { Schema, model, Types } = require("mongoose");

const CommentSchema = new Schema({
  title: { type: String, require: true },
  userID: { type: Types.ObjectId, ref: "users", require: true },
  postID: { type: Types.ObjectId, ref: "recipes" },
  childrenID: [{ type: Types.ObjectId, ref: "comments" }],
  parentID: { type: Types.ObjectId, ref: "comments" },
});

exports.CommentSchema = model("comments", CommentSchema);

const { CommentSchema } = require("../models/commentsModel");
const { recipeschema } = require("../models/recipeModel");
const { UserSchema } = require("../models/userModel");

exports.recipesController = {
  publish: async (req, res) => {
    try {
      const dish = req.body;
      const userID = req.userID;
      const newDish = new recipeschema({
        ...dish,
      });
      await UserSchema.findByIdAndUpdate(userID, {
        $push: { recipes: newDish },
      });
      await newDish.save();
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  },
  getDishes: async (req, res) => {
    try {
      const { category, userID } = req.query;
      if (userID !== "undefined") {
        if (category === "all") {
          const recipes = await recipeschema
            .find({ cook: userID })
            .populate("cook")
            .sort({ _id: -1 });
          res.status(200).json(recipes);
        }

        const recipes = await recipeschema
          .find({ category, cook: userID })
          .populate("cook")
          .sort({ _id: -1 });
        res.status(200).json(recipes);
      }
      if (userID === "undefined") {
        console.log();
        if (category === "all") {
          const recipes = await recipeschema
            .find({})
            .populate("cook")
            .sort({ _id: -1 });

          res.status(200).json(recipes);
        }

        const recipes = await recipeschema
          .find({ category })
          .populate("cook")
          .sort({ _id: -1 });
        res.status(200).json(recipes);
      }
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  likePost: async (req, res) => {
    try {
      const { postID } = req.body;
      const post = await recipeschema.findById(postID, {
        likesCount: 1,
      });
      const updatedPost = await recipeschema.updateOne(
        { _id: postID },
        { likesCount: post.likesCount + 1 }
      );
      res.status(200).json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  },
  toBookmarks: async (req, res) => {
    try {
      const { postID } = req.body;
      const userID = req.userID;
      await UserSchema.updateOne(
        { _id: userID },
        { $addToSet: { bookmarks: postID } }
      );
      res.status(200);
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  },
  getBookmarks: async (req, res) => {
    try {
      const userID = req.userID;
      const bookmarks = await UserSchema.findById(userID, {
        bookmarks: 1,
      }).populate("bookmarks");
      res.status(200).json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  getRecipe: async (req, res) => {
    try {
      const { recipeID } = req.query;
      const recipe = await recipeschema.findOne({ _id: recipeID });
      res.status(200).json(recipe);
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  comment: async (req, res) => {
    try {
      const userID = req.userID;
      const data = req.body;
      const newComment = new CommentSchema({
        ...data,
        userID,
      });
      await newComment.save();
      await recipeschema.findByIdAndUpdate(data.postID, {
        $push: { comments: newComment._id },
      });
      const comment = await CommentSchema.findById(newComment._id).populate(
        "userID"
      );
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  commentChild: async (req, res) => {
    try {
      const userID = req.userID;
      const { parentID, title } = req.body;
      const newComment = new CommentSchema({
        title,
        userID,
        parentID,
      });
      const comment = await newComment.save();
      await CommentSchema.findByIdAndUpdate(parentID, {
        $addToSet: { childrenID: comment._id },
      });
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  getComments: async (req, res) => {
    try {
      const { recipeID } = req.query;
      const arr = [];
      const comments = await CommentSchema.find({ postID: recipeID }).populate(
        "userID"
      );

      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  getChildren: async (req, res) => {
    try {
      const { parentID } = req.query;
      const children = await CommentSchema.find({ parentID }).populate(
        "userID"
      );
      res.json(children);
    } catch (error) {
      res.status(500).json({ message: "server error" }, error);
    }
  },
  getSubscriptions: async (req, res) => {
    try {
      const userID = req.userID;
      const subscribes = await UserSchema.findById(userID, {
        subscriptions: 1,
      })
        .populate("subscriptions")
        .populate("recipes");

      const recipes = [];

      for (item of subscribes.subscriptions) {
        const recipe = await recipeschema
          .find({ cook: item._id })
          .populate("cook");
        recipes.push(recipe);
      }
      res.json(recipes.flat(1).reverse());
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
};

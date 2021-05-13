const { Router } = require("express");
const { recipesController } = require("../controllers/recipesController");
const { AuthMiddleware } = require("../middleware/authMiddlewares");

const router = Router();

//localhost:3001/api/recipes

http: router.post("/publish", AuthMiddleware, recipesController.publish);
router.get("/get-dishes", recipesController.getDishes);
router.post("/like-post", AuthMiddleware, recipesController.likePost);
router.post("/to-bookmarks", AuthMiddleware, recipesController.toBookmarks);
router.get("/get-bookmarks", AuthMiddleware, recipesController.getBookmarks);
router.get("/recipe", recipesController.getRecipe);
router.post("/comment", AuthMiddleware, recipesController.comment);
router.post("/comment-child", AuthMiddleware, recipesController.commentChild);
router.get("/comments", recipesController.getComments);
router.get("/comment-children", recipesController.getChildren);
router.get(
  "/get-subscriptions",
  AuthMiddleware,
  recipesController.getSubscriptions
);
module.exports = router;

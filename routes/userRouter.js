const { Router } = require("express");
const { userController } = require("../controllers/userController");
const { AuthMiddleware } = require("../middleware/authMiddlewares");
// const { uploader } = require("../middleware/uploader");
const router = Router();

//http://localhost:3001/api/user/
router.post("/sign-up", userController.signUp);
router.post("/log-in", userController.logIn);
router.get("/user", userController.getUser);
router.get("/auth-check", AuthMiddleware, userController.authCheck);
router.get("/user-profile", userController.getUserProfile);
router.get("/my-profile", userController.getMyProfile);
router.post("/upload-avatar", AuthMiddleware, userController.uploadPhoto);
// router.post("/upload-avatar", uploader.single("photo"), (req, res) => {
//   res.json(req.file);
// });
router.post("/update-info", AuthMiddleware, userController.updateInfo);
router.put("/subscribe", AuthMiddleware, userController.subscribe);

module.exports = router;

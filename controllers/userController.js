const { UserSchema } = require("../models/userModel");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const { recipeschema } = require("../models/recipeModel");
const { uploader, drive } = require("../middleware/uploader");
const fs = require("fs");

const createAccessToken = (userID, role) => {
  const accessToken = jwt.sign({ userID, role }, config.get("jwt_secret"), {
    expiresIn: config.get("accessExpiresIn"),
  });
  return accessToken;
};
const createRefreshToken = (userID, role) => {
  const refreshToken = jwt.sign({ userID, role }, config.get("jwt_secret"), {
    expiresIn: config.get("refreshExpiresIn"),
  });
  return refreshToken;
};

const createTokens = (userID, role) => {
  const accessToken = createAccessToken(userID, role);
  const refreshToken = createRefreshToken(userID, role);
  return { accessToken, refreshToken };
};

exports.userController = {
  signUp: async (req, res) => {
    try {
      const { email, password, username, role, description } = req.body;
      // const coincidence = await UserSchema.findOne({ email });
      // const usernameCoinc = await UserSchema.findOne({ username });
      // if (coincidence) {
      //   res.status(400).json({ message: "такой пользователь уже есть" });
      // }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new UserSchema({
        email,
        password: hashedPassword,
        username,
        role,
        description,
      });

      await user.save();

      const { accessToken, refreshToken } = createTokens(user._id, user.role);
      res.cookie("refreshToken", refreshToken, { httpOnly: true });
      res.cookie("accessToken", accessToken, { httpOnly: true });

      res.status(201).json({ user, accessToken });
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  logIn: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserSchema.findOne({ email });

      if (!user) res.status(400).json({ message: "пользователь не найден" });
      // if (user.password !== password)
      //   res.status(400).json({ message: "неверный email или пароль" });

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) res.status(400).json({ message: "пароли не совпадают" });

      const { accessToken, refreshToken } = createTokens(user._id, user.role);
      res.cookie("refreshToken", refreshToken, { httpOnly: true });
      res.cookie("accessToken", accessToken, { httpOnly: true });

      res.status(200).json({ user, accessToken });
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  getUser: async (req, res) => {
    try {
      const { userID } = req.query;
      const user = await UserSchema.findById(userID);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  authCheck: async (req, res) => {
    try {
      const { userID } = req;
      const user = await UserSchema.findById(userID);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  getUserProfile: async (req, res) => {
    try {
      const { username } = req.query;
      const user = await UserSchema.findOne({ username }).populate("recipes");
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  getMyProfile: async (req, res) => {
    try {
      const userID = req.userID;
      const user = await UserSchema.findById(userID).populate("recipes");
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  updateInfo: async (req, res) => {
    try {
      const data = req.body;
      const userID = req.userID;
      if (data.username) {
        await UserSchema.findByIdAndUpdate(userID, { username: data.username });
      }
      if (data.description) {
        await UserSchema.findByIdAndUpdate(userID, {
          description: data.description,
        });
      }
      delete data.username;
      delete data.description;
      await UserSchema.findByIdAndUpdate(userID, { fullInfo: data });
      res.status(200).json({ message: "Full info has been updated!" });
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  subscribe: async (req, res) => {
    try {
      const { otherID } = req.body;
      const userID = req.userID;

      await UserSchema.findByIdAndUpdate(otherID, {
        $addToSet: { followers: userID },
      });
      await UserSchema.findByIdAndUpdate(userID, {
        $addToSet: { subscriptions: otherID },
      });

      res.status(200);
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  uploadPhoto: async (req, res) => {
    try {
      const userID = req.userID;
      uploader(req, res, (err) => {
        const requestBody = {
          name: req.file.filename,
          mineType: req.file.minetype,
        };
        const media = {
          mineType: req.file.minetype,
          body: fs.createReadStream(req.file.path),
        };
        drive.files.create(
          {
            requestBody,
            media,
            fields: "id",
          },
          async (err, file) => {
            fs.unlinkSync(req.file.path);

            await drive.permissions.create({
              fileId: file.data.id,
              requestBody: {
                role: "reader",
                type: "anyone",
              },
            });
            const path = `https://drive.google.com/uc?export=view&id=${file.data.id}`;
            await UserSchema.findByIdAndUpdate(userID, {
              avatar: path,
            });
            res.json(path);
          }
        );
      });
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
};

const multer = require("multer");
const { nanoid } = require("nanoid");
const { google } = require("googleapis");

const CLIENT_ID =
  "677097272102-cq8ub5g38gv3r58im7edkiqicd1rbovi.apps.googleusercontent.com";
const CLIENT_SECRET = "bAXOc-gH50e33l7NZrMUBpAc";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
  "1//04Jv4PwLeJqd4CgYIARAAGAQSNwF-L9Ir4mX2wS_OquuGjv-BNig7FxVnKL7ERaMvxQzph6I5jrWwUMtvB6SeQ3qs2lLMx3V8G7s";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "../client/public/avatars");
  },
  filename: (_, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + nanoid(3) + "." + file.mimetype.split("/").pop()
    );
  },
});
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

exports.drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

exports.uploader = multer({
  storage,
}).single("photo");

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const https = require("https");

const port = process.env.PORT || 3000;

const app = express();

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true, limit: "150mb" }));
app.use(express.json({ limit: "150mb" }));
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  next();
});

app.post("/i-r/dropbox/upload", (req, res) => {
  // "https://www.dropbox.com/1/oauth2/authorize?client_id=<app key>&response_type=code&redirect_uri=<redirect URI>&state=<CSRF token>"

  console.log("received HS request");

  //body object contains raw data under body.data, and the file name under body.name
  //in theory if you throw this into a serverless function it should actually work
  let body = req.body;

  let b64Array = body.data;
  let b64string = b64Array[1];

  let byteCharacters = Buffer.from(b64string, "base64");

  const byteArray = toArrayBuffer(byteCharacters);

  console.log("byte Arr:");
  console.log(byteArray);

  console.log(byteCharacters);
  function toArrayBuffer(buf) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return ab;
  }

  let dropboxapi_opts = JSON.stringify({
    path: "/Homework/math/" + body.name,
    mode: "add",
    autorename: true,
    mute: false,
    strict_conflict: false,
  });

  console.log("DB options");
  console.log(dropboxapi_opts);

  let TOKEN = process.env.DB_KEY;

  const request = https.request(
    "https://content.dropboxapi.com/2/files/upload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Dropbox-API-Arg": dropboxapi_opts,
        "Content-Type": "application/octet-stream",
      },
    },
    (res) => {
      console.log("statusCode: ", res.statusCode);
      console.log("headers: ", res.headers);

      res.on("data", function (d) {
        process.stdout.write(d);
      });
    }
  );

  request.write(byteCharacters);
  request.end();
});

app.listen(port, () => console.log("Server Running"));

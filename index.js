require("dotenv").config();
const express = require("express");
const cors = require("cors");

const https = require("https");
const { URLSearchParams } = require("url");
const { response } = require("express");

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

app.get("/token-test", (req, res) => {
  console.log("testing programmatic auth");

  const request = https.request(
    "https://api.dropboxapi.com/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
    (res) => {
      console.log(res.statusCode)
      console.log(res.statusMessage);
    }
  );

  request.write(
    new URLSearchParams(
      Object.entries({
        grant_type: "authorization_code",
        [process.env.DB_ID]: process.env.DB_KEY,
      })
    ).toString()
  );

  request.end()

  console.log("after request.write")
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

  let TOKEN = process.env.DB_API_KEY;

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

app.get('/show-files', (req, response) => {
  let dropboxapi_opts = JSON.stringify({
    "path": "/Homework/math",
    "recursive": false, 
    "include_media_info": false, 
    "include_deleted": false, 
    "include_has_explicit_shared_members": false, 
    "include_mounted_folders": true, 
    "include_non_downloadable_files": true
  });

  let TOKEN = process.env.DB_API_KEY;
  //   console.log(TOKEN)

  console.log(dropboxapi_opts)
  
  //   https://api.dropboxapi.com/2/files/list_folder - dropbox endpoint for folder>file listing
  const request = https.request(
    "https://api.dropboxapi.com/2/files/list_folder",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      }
    },
    (res) => {
      console.log("statusCode: ", res.statusCode);
      console.log("headers: ", res.headers);
      // console.log(res)
      
      res.on("data", function (d) {
        // process.stdout.write(d);
        console.log(JSON.parse(d.toString()))
        // sendResponse(JSON.parse(d.toString()))

        response.send(JSON.parse(d.toString()))
      });
    }
  );
  request.write(dropboxapi_opts)
  request.end();

})

app.listen(port, () => console.log("Server Running"));

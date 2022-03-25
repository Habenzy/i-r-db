require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("isomorphic-unfetch");
const atob = require("atob");
const Blob = require("node-blob");

const { API_KEY } = process.env;
const port = process.env.PORT || 3000;

const app = express();

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
  console.log("received HS request");
  console.log(req);
  let body = req.body;

  console.log("body data");
  console.log(body.data);

  let b64Array = body.data.split("base64,");
  let b64string = b64Array[1];
  let b64FileType = b64Array[0];
  console.log(b64Array);
  console.log(b64FileType);
  // Base64 Back to String
  //  var byteCharacters = Buffer.from(b64string, 'base64');

  const byteCharacters = atob(body.data);

  //
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], { type: "application/pdf" });

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
  })

  console.log("DB options")
  console.log(dropboxapi_opts)

  fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      Authorization: "Bearer sl.BEek4nRMoQ2P_wNNk8fxUHo52-bWUtteDUlA_ye4tyMQnQ0ufy9tyuYeslwSZ8CsgpODy4eGB3UpE1r6_1GyVfCQlbbVJ2m6bOmPZHNudQuj9nlTcD4u61Pxf6wsFdmUFAVwsa6JG-Dr",
      "Content-Type": "text/plain; charset=dropbox-cors-hack",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Dropbox-API-Arg": dropboxapi_opts,
    },
    body: blob,
  })
    .then(function (response) {
      return response.json();
    })
    .then((response) => {
      console.log("response");
      console.log(response)
      res.json(response);
    })
    .catch((error) => {
      console.error("test1" + error);
      console.log(error)
      res.json(error);
    });
});

app.listen(port, () => console.log("Server Running"));

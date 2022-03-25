const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 3000

const app = express()

app.use(express.static('./public'))
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

app.post('/i-r/dropbox/upload', (req, res) => {
  console.log("received HS request")
  console.log(req.body)
  res.json({"status": "hit the endpoint"})
})

app.listen(port, () => console.log("Server Running"))

const express = require('express')
const port = process.env.PORT || 3000

const app = express()

app.use(express.static('./public'))
app.use(express.urlencoded({extended: true}))

app.post('/i-r/dropbox/upload', (req, res) => {
  res.json({"status": "hit the endpoint"})
})

app.listen(port, () => console.log("Server Running"))

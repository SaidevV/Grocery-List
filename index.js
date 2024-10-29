var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var http = require("http").Server(app);
var socketio = require("socket.io")(http);
var mongoose = require("mongoose");
var theDatabaseURL = "mongodb+srv://saidev:123498765@cluster0.jwfvw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose.connect(theDatabaseURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log("MongoDB connection error:", err));

var Item = mongoose.model('Item', { item: String });

app.get('/items', async (req, res) => {
  try {
    const allItems = await Item.find({});
    res.send(allItems);
  } catch (err) {
    res.sendStatus(500);
  }
});

app.post('/items', async (req, res) => {
  console.log('Received POST request with data:', req.body);  // Log request data
  var item = new Item(req.body);
  try {
    await item.save();
    console.log('Item saved successfully.');  // Log success
    socketio.emit('broadcast', req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error saving item:', err);  // Log error
    res.sendStatus(500);
  }
});

socketio.on('connection', (socket) => {
  console.log("Roommate Connected");
});

var server = http.listen(3000, () => {
  console.log("Server running at http://localhost:" + server.address().port);
});

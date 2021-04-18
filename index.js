const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const fileUpload = require("express-fileupload");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nl16z.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("detectives"));
app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello from the other side, I must have called a thousand times");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const appointmentCollection = client
    .db("detectiveAgency")
    .collection("appointments");
  const detectiveCollection = client
    .db("detectiveAgency")
    .collection("detectives");
  const serviceCollection = client.db("detectiveAgency").collection("services");
  const testimonialCollection = client
    .db("detectiveAgency")
    .collection("testimonial");

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/appointments", (req, res) => {
    appointmentCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/appointmentsByDate", (req, res) => {
    const date = req.body;
    const email = req.body.email;
    detectiveCollection.find({ email: email }).toArray((err, detectives) => {
      const filter = { date: date.date };
      if (detectives.length === 0) {
        filter.email = email;
      }
      appointmentCollection
        .find({ date: date.date })
        .toArray((err, documents) => {
          res.send(documents);
        });
    });
  });

  app.post("/addADetective", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    detectiveCollection.insertOne({ name, email, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    serviceCollection.insertOne({ name, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addAdmin", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;

    detectiveCollection.insertOne({ name, email }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/detectives", (req, res) => {
    detectiveCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/isDetective", (req, res) => {
    const email = req.body.email;
    detectiveCollection.find({ email: email }).toArray((err, detectives) => {
      res.send(detectives.length > 0);
    });
  });
});

app.listen(process.env.PORT || port);

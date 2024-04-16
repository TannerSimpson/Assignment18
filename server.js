const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

mongoose
  .connect("mongodb+srv://TannerSimpson:Tannerman123@cluster0.emtozuj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("couldn't connect to mongodb", error);
  });
const craftSchema = new mongoose.Schema({
  name: String,
  description: String,
  supplies: [String],
  img: String,
});

const Craft = mongoose.model("Craft", craftSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/api/crafts", (req, res) => {
  getCrafts(res);
});

const getCrafts = async (res) => {
  const crafts = await Craft.find();
  res.send(crafts);
};

app.get("/api/crafts/:id", (req, res) => {
  getCraft(req.params.id, res);
});

const getCraft = async (id, res) => {
  const craft = await Craft.findOne({ _id: id });
  res.send(craft);
};

app.post("/api/crafts", upload.single("img"), (req, res) => {
  const result = validateCraft(req.body);
  console.log(result);
  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const craft = new Craft({
    name: req.body.name,
    description: req.body.description,
    supplies: req.body.supplies.split(","),
  });

  if (req.file) {
    craft.img = "images/" + req.file.filename;
  }

  createCraft(craft, res);
});

const createCraft = async (craft, res) => {
  const result = await craft.save();
  res.send(craft);
};

app.put("/api/crafts/:id", upload.single("img"), (req, res) => {
  const result = validateCraft(req.body);
  console.log(result);
  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }
  updateCraft(req, res);
});

const updateCraft = async (req, res) => {
  let fieldsToUpdate = {
    name: req.body.name,
    description: req.body.description,
    supplies: req.body.supplies.split(","),
  };

  if (req.file) {
    fieldsToUpdate.img = "images/" + req.file.filename;
  }

  const result = await Craft.updateOne({ _id: req.params.id }, fieldsToUpdate);

  res.send(result);
};

app.delete("/api/crafts/:id", (req, res) => {
  removeCraft(res, req.params.id);
});

const removeCraft = async (res, id) => {
  const craft = await Craft.findByIdAndDelete(id);
  res.send(craft);
};

function validateCraft(craft) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
    supplies: Joi.allow(""),
    _id: Joi.allow(""),
  });

  return schema.validate(craft);
}

app.listen(3000, () => {
  console.log("I'm listening");
});
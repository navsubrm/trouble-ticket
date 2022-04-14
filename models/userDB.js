//External imports
const mongoose = require("mongoose");

let UserDB = null;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: () => Date.now(),
  },
});

//This calls a function before the criteria you select, for example, this will run before save.
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

if (UserDB == null) {
  UserDB = mongoose.model("UserDB", userSchema);
}

module.exports = UserDB;

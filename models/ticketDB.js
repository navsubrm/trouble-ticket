//External imports
const mongoose = require("mongoose");

let TicketDB = null;

const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  division: {
    type: String,
    required: true,
  },
  dateStarted: {
    type: Date,
    required: true,
  },
  priority: {
    type: String,
    require: true,
  },
  comments: {
    type: String,
    required: true,
  },
  ticketStatus: {
    type: String,
    required: false,
  },
  iwComments: {
    type: String,
    required: false,
  },
  ticketIdentifier: {
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
ticketSchema.pre("updateOne", function () {
  this.set({ updatedAt: new Date() });
});

if (TicketDB == null) {
  TicketDB = mongoose.model("TicketDB", ticketSchema);
}

module.exports = TicketDB;

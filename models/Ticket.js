const TicketDB = require("./ticketDB");

class Ticket {
  constructor(ticket) {
    this.ticket = ticket;
    this.errors = [];
  }

  //Sanitize database inputs.
  sanitize() {
    if (typeof this.ticket.name != "string") this.ticket.name = "";
    if (typeof this.ticket.department != "string") this.ticket.department = "";
    if (typeof this.ticket.division != "string") this.ticket.division = "";
    if (isNaN(Date.parse(this.ticket.dateStarted))) this.ticket.dateStarted = new Date();
    if (isNaN(this.ticket.priority)) this.ticket.priority = 1;
    if (!Array.isArray(this.ticket.system)) this.ticket.system = [this.ticket.system];
    if (typeof this.ticket.machineIdentifier != "string") this.ticket.machineIdentifier = "";
    if (typeof this.ticket.comments != "string") this.ticket.comments = "";
    //Remove any additional properties by resetting this.ticket to only required properties.
    this.ticket = {
      name: this.ticket.name,
      department: this.ticket.department,
      division: this.ticket.division,
      dateStarted: this.ticket.dateStarted,
      priority: this.ticket.priority,
      comments: this.ticket.comments,
      ticketIdentifier: `${this.ticket.name}/${this.ticket.dateStarted}`,
      ticketStatus: null,
      iwComments: null,
    };
  }

  async duplicateCheck() {
    //Check for duplicate tags based on name, dateStarted, and machineIdentifier.
    const result = await TicketDB.find({ ticketIdentifier: `${this.ticket.name}/${this.ticket.dateStarted}` });

    if (result.length > 0) this.errors.push("That ticket already exists. See IW division.");
  }

  //Save file to the database.
  async addTicketToDB() {
    const ticketDb = new TicketDB({ ...this.ticket });
    try {
      await ticketDb.save();
      return;
    } catch (e) {
      return this.errors.push(`Something went wrong. Contact IW division for assistance. ${e}`);
    }
  }

  //Run processes for checking and saving new ticket data.
  async submitTicket() {
    this.sanitize();
    await this.duplicateCheck();
    if (this.errors.length == 0) {
      await this.addTicketToDB();
      return { data: this.ticket, errors: this.errors };
    } else {
      return { data: this.ticket, errors: this.errors };
    }
  }

  //Get tickets based on route with query name and query passed in. Return formatted list.
  async getTicketList(query) {
    const result = await TicketDB.find(query);
    const formattedList = await this.formatTicketList(result);
    const sortedList = formattedList.sort((a, b) => {
      return b.updatedAt - a.updatedAt;
    });
    return sortedList;
  }

  async getTicketById(id) {
    const ticket = await TicketDB.findOne({ _id: id });
    return ticket;
  }

  async deleteTicket(id) {
    const result = await TicketDB.deleteOne({ _id: id });
    return result;
  }

  async updateStatus(id, ticketStatus, iwComments) {
    if (typeof ticketStatus != "string") ticketStatus = "";
    if (typeof iwComments != "string") iwComments = "";
    return await TicketDB.updateOne({ _id: id }, { $set: { ticketStatus, iwComments } });
  }

  //Clear tickets at least 6 months old, archived, and not interacted with.
  async clearOldTickets(dateModifier) {
    if (!dateModifier || dateModifier <= 6) dateModifier = 6;
    const dateObject = new Date();
    const archiveRetentionSetPoint = dateObject.setMonth(dateObject.getMonth() - dateModifier);
    const deleteTicketList = await TicketDB.deleteMany({ ticketStatus: { $eq: "archive" }, updatedAt: { $lte: archiveRetentionSetPoint } });
    return deleteTicketList;
  }

  //Set format updates for readability.
  async formatTicketList(ticketList) {
    ticketList.forEach((cur) => {
      cur.dateStarted = this.formatTime(cur.dateStarted);
      cur.system = this.formatSystem(cur.system);
      cur.updatedAt = this.formatTime(cur.updatedAt);
      cur.priority = this.convertPriority(cur.priority);
      cur.daysSinceUpdate = this.dayCount(cur.updatedAt);
    });

    return ticketList;
  }

  //Convert the priority value to associated string.
  convertPriority(priority) {
    switch (parseInt(priority)) {
      case 1:
        return "Not Applicable";
      case 2:
        return "Routine";
      case 3:
        return "Priority";
      case 4:
        return "High Priority";
      case 5:
        return "Immediate";
      default:
        return "Unknown";
    }
  }

  formatSystem(systemArr) {
    if (!Array.isArray(systemArr)) return systemArr;
    let text = "";
    systemArr.forEach(function (cur, i) {
      if (i < systemArr.length - 1) {
        text += `${cur}, `;
      } else {
        text += `${cur}`;
      }
    });
    return text;
  }

  formatTime(time) {
    return new Date(time).toLocaleDateString();
  }

  dayCount(value) {
    return Math.round((new Date() - new Date(value)) / (1000 * 3600 * 24));
  }
}

module.exports = Ticket;

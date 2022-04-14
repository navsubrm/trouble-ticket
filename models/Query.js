const TicketDB = require("./ticketDB");

class Query {
  constructor(query, value = "") {
    this.query = query;
    this.search = value;
    this.dateDiff = this.stagnantTicket();
  }

  dynamicQuery() {
    if (typeof this.value != "string") this.value = "";
    const returnQuery = {
      $or: [
        { name: { $regex: this.search, $options: "gi" } },
        { department: { $regex: this.search, $options: "gi" } },
        { division: { $regex: this.search, $options: "gi" } },
        { priority: { $regex: this.search, $options: "gi" } },
        { comments: { $regex: this.search, $options: "gi" } },
        { ticketStatus: { $regex: this.search, $options: "gi" } },
        { iwComments: { $regex: this.search, $options: "gi" } },
      ],
    };
    return returnQuery;
  }

  staticQuery() {
    const query = {
      requires_action: { updatedAt: { $lte: this.dateDiff } },
      //Separate query name by underscore.
      active: { ticketStatus: { $ne: "archive" } },
      in_progress: { ticketStatus: { $eq: "in-progress" } },
      awaiting_response: { ticketStatus: { $eq: "awaiting-response" } },
      help_ticket_submitted: { ticketStatus: { $eq: "help-ticket-submitted" } },
      completed: { ticketStatus: { $eq: "completed" } },
      archive: { ticketStatus: { $eq: "archive" } },
      //Add a section of queries that will check by department.
      engineering: { department: { $eq: "engineering" } },
      executive: { department: { $eq: "executive" } },
      medical: { department: { $eq: "medical" } },
      navigation: { department: { $eq: "navigation" } },
      supply: { department: { $eq: "supply" } },
      weapons: { department: { $eq: "weapons" } },
    };
    return query[this.query];
  }

  stagnantTicket() {
    const today = new Date();
    const date = today.getDate();
    const monthOld = new Date().setDate(date - 15);
    return new Date(monthOld);
  }
}

module.exports = Query;

require("dotenv").config();
const Ticket = require("../models/Ticket");
const Query = require("../models/Query");

//Submit a new ticket using the ticket model submit ticket.
exports.submitTicket = async function (req, res) {
  try {
    const newTicket = new Ticket(req.body);
    const result = await newTicket.submitTicket();

    if (result.errors.length == 0) {
      req.flash("success", "Ticket submitted.");
      req.session.save(() => res.redirect("/"));
    } else {
      req.flash("errors", result.errors);
      req.session.save(() => res.redirect("/"));
    }
  } catch (err) {
    res.flash("errors", `Something went wrong - ${err}`);
    req.session.save(() => res.redirect("/"));
  }
};

exports.ticketList = async function (req, res) {
  if (req.session.user) {
    let query, route;
    try {
      //Select query based on whether post or get route. If post, body will contain value.  If not, params route will be use.  This uses the filter select from ticket list and quick search form in the header.
      if (req.body.value) {
        query = new Query(req.body.query, req.body.value).dynamicQuery();
        route = "dynamic_query"; //formatted to align with other routes for string conversion.
      } else {
        query = new Query(req.params.route).staticQuery();
        route = req.params.route;
      }
      const ticketList = await new Ticket().getTicketList(query);
      res.render("ticket-list", {
        ticketList,
        title: capitalizeTitle(route, "Ticket List"),
        route,
        errors: req.flash("errors"),
        success: req.flash("success"),
      });
    } catch (err) {
      req.flash("errors", err);
      req.session.save(() => res.redirect("/404"));
    }
  } else {
    res.redirect("/404");
  }
};
//Reformat route to include new
function capitalizeTitle(title, addon) {
  let finalTitle = "";
  let titleArray = title.split(/_/g);
  titleArray.forEach((cur) => {
    let start = cur.slice(0, 1).toUpperCase();
    let end = cur.toLowerCase().substring(1);
    finalTitle += `${start}${end} `;
  });
  return finalTitle + addon;
}
//Update ticket information in the database.
exports.updateTicket = async function (req, res) {
  if (req.session.user) {
    try {
      const ticket = await new Ticket().updateStatus(req.params.id, req.body.ticketStatus, req.body.iwComments);
      if (ticket.acknowledged) {
        req.flash("success", `Ticket #${req.params.id} was successfully saved.`);
        req.session.save(() => res.redirect(`/ticket-list/${req.body.route}`));
      } else {
        req.flash("errors", `Ticket #${req.params.id} failed to update.`);
        req.session.save(() => res.redirect(`/ticket-list/${req.body.route}`));
      }
    } catch (err) {
      req.flash("errors", err);
      req.session.save(() => res.redirect("/404"));
    }
  } else {
    res.redirect("/404");
  }
};
//Delete single ticket.
exports.deleteTicket = async function (req, res) {
  if (req.session.user) {
    try {
      const deletedTicket = await new Ticket().deleteTicket(req.params.id);
      if (deletedTicket.acknowledged) {
        req.flash("success", `Ticket #${req.params.id} was successfully deleted.`);
        req.session.save(() => res.redirect(`/ticket-list/${req.body.route}`));
      } else {
        req.flash("errors", `Ticket #${req.params.id} failed to delete.`);
        req.session.save(() => res.redirect(`/ticket-list/${req.body.route}`));
      }
    } catch (err) {
      req.flash("errors", err);
      req.session.save(() => res.redirect("/404"));
    }
  } else {
    res.redirect("/404");
  }
};

//Do the same thing you did with the ticket list route.
exports.exportTicketList = async function (req, res) {
  if (req.session.user) {
    try {
      const content = JSON.parse(req.body.ticketList);
      res.render("export-email", {
        title: "Export Email",
        emailSubject: "Trouble Ticket Export",
        content: content,
        errors: req.flash("errors"),
        success: req.flash("success"),
      });
    } catch (err) {
      req.flash("errors", err);
      req.session.save(() => res.redirect("/404"));
    }
  } else {
    res.redirect("/404");
  }
};

exports.cleanUpArchive = async function (req, res) {
  if (req.session.user) {
    let modifier = process.env.ARCHIVE_RETENTION_MODIFIER;
    try {
      const cleanUpList = await new Ticket().clearOldTickets(parseInt(modifier));
      req.flash("success", `${cleanUpList.deletedCount} old tickets have been removed.`);
      req.session.save(function () {
        res.redirect("/");
      });
    } catch (err) {
      req.flash("errors", err);
      req.session.save(() => res.redirect("/404"));
    }
  } else {
    res.redirect("/404");
  }
};

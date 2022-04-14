exports.tos = function (req, res) {
  res.render("terms-of-use", { title: "Terms of Service", errors: req.flash("errors"), success: req.flash("success") });
};

exports.about = function (req, res) {
  res.render("about", { title: "About | Help", errors: req.flash("errors"), success: req.flash("success") });
};

exports.register = function (req, res) {
  if (req.session.user) {
    res.render("register", { title: "Register User", action: "/register", data: null, errors: req.flash("errors"), success: req.flash("success") });
  } else {
    res.render("404", { title: "Page Not Found." });
  }
};

exports.newTicket = function (req, res) {
  if (req.session.user) {
    res.render("ticket-entry", { title: "Enter Ticket", errors: req.flash("errors"), success: req.flash("success") });
  } else {
    res.redirect("/");
  }
};

exports.pageNotFound = function (req, res) {
  res.render("404", { title: "Error Page", errors: req.flash("errors"), success: req.flash("success") });
};

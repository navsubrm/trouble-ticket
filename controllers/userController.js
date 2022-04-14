const res = require("express/lib/response");
const User = require("../models/User");

exports.register = async function (req, res) {
  const user = new User(req.body);
  const result = await user.register();

  if (result.errors.length == 0) {
    req.flash("success", "User Created.");
    req.session.save(() => res.redirect("/"));
  } else {
    req.flash("errors", result.errors);
    req.session.save(function () {
      res.render("register", { title: "Register User", action: "/register", data: result.data, errors: req.flash("errors"), success: req.flash("success") });
    });
  }
};

exports.login = async function (req, res) {
  const user = new User(req.body);
  try {
    const result = await user.login();
    if (result.errors.length > 0) {
      req.flash("errors", "Invalid username or password.");
      return req.session.save(() => res.redirect("/"));
    }
    req.session.user = { username: user.user.username };
    req.session.save(() => res.redirect("/"));
  } catch (e) {
    req.flash("errors", `Login failed. ${e}`);
    req.session.save(() => res.redirect("/"));
  }
};

exports.logout = async function (req, res) {
  req.session.destroy();
  res.redirect("/");
};

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("home", { title: "Home", errors: req.flash("errors"), success: req.flash("success") });
  } else {
    res.render("home-guest", { title: "Enter Ticket", errors: req.flash("errors"), success: req.flash("success") });
  }
};

//Runs on the get route /update-user
exports.getUpdateUser = async function (req, res) {
  if (req.session.user) {
    const user = await new User().getUserByUsername(req.session.user.username);
    res.render("register", {
      title: "Update User",
      action: "/update-user",
      data: { name: user.name, username: user.username },
      errors: req.flash("errors"),
      success: req.flash("success"),
    });
  }
};

//Runs on post route /update-user
exports.updateUser = async function (req, res) {
  if (req.session.user) {
    const user = await new User(req.body).updateUserData();

    if (user.errors.length == 0) {
      req.flash("success", "User updated.");
      req.session.save(() =>
        res.render("register", { title: "Update User", action: "/update-user", data: user.data, errors: req.flash("errors"), success: req.flash("success") })
      );
    } else {
      req.flash("errors", user.errors);
      req.session.save(() => {
        res.render("register", { title: "Update User", action: "/update-user", data: user.data, errors: req.flash("errors"), success: req.flash("success") });
      });
    }
  }
};

exports.getUserList = async function (req, res) {
  if (req.session.user) {
    try {
      const userList = await new User().getUserList();
      res.render("user-delete", { title: "Delete User", userList, errors: req.flash("errors"), success: req.flash("success") });
    } catch (err) {
      res.redirect("/404");
    }
  }
};

exports.deleteUser = async function (req, res) {
  if (req.session.user) {
    try {
      const success = await new User().deleteUser(req.body.userId);
      if (success.deletedCount > 0) {
        req.flash("success", "User was deleted");
        req.session.save(() => {
          res.redirect("/delete-user");
        });
      } else {
        req.flash("danger", "something went wrong.  Please try again.");
        req.session.save(() => {
          res.redirect("/delete-user");
        });
      }
    } catch (err) {
      res.redirect("/404");
    }
  }
};

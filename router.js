const express = require("express");
const router = express.Router();
const ticketController = require("./controllers/ticketController");
const userController = require("./controllers/userController");
const staticController = require("./controllers/staticController");

//Basic static routes.
router.get("/", userController.home);
router.get("/terms-of-use", staticController.tos);
router.get("/about", staticController.about);
router.get("/register", staticController.register);
router.get("/new-ticket", staticController.newTicket);
router.get("/404", staticController.pageNotFound);

//Ticket Routes:
router.get("/ticket-list/:route", ticketController.ticketList);
router.post("/ticket-list", ticketController.ticketList);
router.post("/submit", ticketController.submitTicket);
router.post("/update/:id", ticketController.updateTicket);
router.post("/delete/:id", ticketController.deleteTicket);
router.post("/export", ticketController.exportTicketList);
router.get("/clean-up-archive", ticketController.cleanUpArchive);

//User Routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/update-user", userController.getUpdateUser);
router.post("/update-user", userController.updateUser);
router.get("/delete-user", userController.getUserList);
router.post("/delete-user", userController.deleteUser);

//Catch route for bad routes.
router.get("*", function (req, res) {
  res.redirect("/404");
});

module.exports = router;

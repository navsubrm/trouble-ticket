const SHA256 = require("crypto-js/sha256");
const { response } = require("express");
const UserDB = require("./userDB");

class User {
  constructor(user) {
    this.user = user;
    this.errors = [];
    this.defaultUser = {
      name: "administrator",
      username: process.env.ADMIN_ACCOUNT,
      password: SHA256(process.env.ADMIN_PASSWORD).toString(),
    };
  }

  async checkDefaultUser() {
    const userDb = new UserDB(this.defaultUser);
    const res = await UserDB.find({ username: this.defaultUser.username });
    if (res.length > 0) return;
    await userDb.save();
  }

  //Check for any non-string values and remove them for security.
  sanitize() {
    Object.entries(this.user).forEach((key, value) => {
      if (typeof value != "string") {
        this.user[key] = "";
      }
    });
  }
  //Check if inputs meet requirements.
  validate() {
    if (this.user.password !== this.user.confirmPw) {
      this.errors.push("Passwords do not match.");
    }
    if (this.user.username.match(/[A-Za-z0-9._%+-]{5,50}/) == null) {
      this.errors.push("Username must be between 5 and 15 characters.");
    }
    if (this.user.password.match(/^(?=.*\d)(?=.*[a-z].*[a-z])(?=.*[A-Z].*[A-Z])(?=.*[a-zA-Z])(?=.*[!@#$%&*()_+].*[!@#$%&*()_+]).{14,}$/g) == null) {
      this.errors.push("Password must be 15 characters, with 2 upper and 2 lower and 2 special characters.");
    }
    this.user = {
      name: this.user.name.trim().toLowerCase(),
      username: this.user.username.trim().toLowerCase(),
      password: this.user.password,
    };
  }

  async duplicateCheck() {
    const res = await UserDB.find({ username: this.user.username });

    if (res.length > 0) this.errors.push("Username already exists.");
  }

  async addUserToDB() {
    const userDb = new UserDB({
      name: this.user.name,
      username: this.user.username,
      password: SHA256(this.user.password).toString(),
    });
    try {
      const response = await userDb.save();
    } catch (e) {
      this.errors.push(`Something went wrong. ${e}`);
    } finally {
      return { errors: this.errors };
    }
  }

  async register() {
    this.sanitize();
    this.validate();
    await this.duplicateCheck();
    if (this.errors.length == 0) {
      await this.addUserToDB();
    }
    return { data: { username: this.user.username, name: this.user.name }, errors: this.errors };
  }

  async login() {
    try {
      const res = await this.getUserByUsername(this.user.username);
      if (!res || res?.password != SHA256(this.user.password).toString()) {
        this.errors.push("Invalid username or password");
      }
    } catch (e) {
      this.errors.push(e);
    } finally {
      return { errors: this.errors };
    }
  }

  async updateUserData() {
    this.sanitize();
    this.validate();
    if (this.errors.length == 0) {
      try {
        const res = await UserDB.updateOne(
          { username: this.user.username },
          {
            $set: {
              name: this.user.name,
              username: this.user.username,
              password: SHA256(this.user.password).toString(),
            },
          }
        );
      } catch (err) {
        this.errors.push(err);
      } finally {
        return { errors: this.errors };
      }
    }
  }

  async getUserByUsername(username) {
    try {
      return await UserDB.findOne({ username });
    } catch (e) {
      return {};
    }
  }

  async getUserList() {
    const response = await UserDB.find({}, { password: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    return response;
  }

  async deleteUser(userId) {
    const res = await UserDB.deleteOne({ _id: userId });
    return res;
  }
}

module.exports = User;

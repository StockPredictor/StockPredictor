const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Signup
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, password: hashedPassword });
    await user.save();

    req.session.user = {_id: user._id, username: user.username}; // Stores username in session, only expires on logout/timeout
    res.render("stocks", { title: "account", userID: req.session.user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    req.session.user = {_id: user._id, username: user.username}; // Stores username in session, only expires on logout/timeout
    res.render("stocks", { title: "account", userID: req.session.user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post('/changeuser', async (req, res) => {
  if (!req.session.user) {
      return res.status(401).send('Unauthorized'); // Ensure the user is logged in
  }
  //request new name
  const { newUsername } = req.body;
  //cannot be left blank
  if (!newUsername || newUsername.trim() === '') {
      return res.status(400).send('New username is required');
  }

  try {
      // Update the username in the database, based on the new name stored in the session
      await User.findByIdAndUpdate(req.session.user._id, { username: newUsername.trim() });
      req.session.user.username = newUsername.trim();

        res.redirect('/account'); // Redirect to the account page after success
    } catch (err) {
        console.error('Error updating username:', err);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/changepass', async (req, res) => {
  if (!req.session.user) {
      return res.status(401).send('Unauthorized'); //for non-logged in users, no weird requests
  }
  const {oldPassword, newPassword, confirmPassword} = req.body;
  if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).send('All fields are required');
  }
  if (newPassword !== confirmPassword) {
      return res.status(400).send('New passwords do not match');
  }
  try {
      const user = await User.findById(req.session.user._id);
      if (!user) {
          return res.status(404).send('User not found');
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
          return res.status(400).send('Old password is incorrect');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(req.session.user._id, { password: hashedPassword });
      res.redirect('/account'); // Redirect to the account page after success
  } catch (err) {
      console.error('Error updating password:', err);
      res.status(500).send('Internal Server Error');
  }
});
module.exports = router;

import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "Username or email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET
    );

    // This line sets a cookie named "token" on the client's browser using the Express res.cookie() method.
    res.cookie("token", token, {
      httpOnly: true, // The cookie cannot be accessed via JavaScript (document.cookie) Protects against XSS (Cross-Site Scripting) attacks Highly recommended for auth tokens
      //   secure: true, Only send this cookie over HTTPS connections. Since http://localhost is not HTTPS, the browser will ignore the cookie entirely.
      //   secure: process.env.NODE_ENV === "production", // only true in production, If your app is running in production mode (like on Vercel, Render, etc.) then secure: true, If you're running locally (on localhost) then secure: false
      //   sameSite: "Strict",// sends cookie only on same-site requests, which means it will not be sent on cross-origin requests. means suppose i am logged-in in this website and i open another website (ex: facebook) and then from the facebook i click the link of this website so i have to login again. because of samesite: strict, therefore the cookie will not be sent in that case.
      //   sameSite: 'Lax' ,// sends cookie on normal links (GET navigation), but blocks it on POST requests or <form> submissions.
      //   sameSite: 'None' // sends cookie on all requests, but requires secure: true
    }); // Set cookie with HttpOnly and Secure flags

    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

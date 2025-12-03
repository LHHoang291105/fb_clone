const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      name,
      password: hashed,
    });
    const JWT_SECRET = process.env.JWT_SECRET;

    const data = {
      userId: user._id,
    };
    
    const accessToken = jwt.sign(data, JWT_SECRET);

    return res.status(200).json({
      success: true,
      message: "Đăng ký thành công",
      accessToken,
    });

    res.status(201).json({ message: "user created", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

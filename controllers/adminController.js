const { User } = require("../models");
const bcrypt = require("bcryptjs");

// GET: List all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });

    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE: Delete user by ID (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const deleted = await User.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST: Create student or librarian (admin only)
exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, surname, email, password, role, student_card_number } =
      req.body;

    if (!name || !surname || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["student", "librarian"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be student or librarian" });
    }

    if (role === "student" && !student_card_number) {
      return res
        .status(400)
        .json({ message: "Student card number is required for students" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      surname,
      email,
      password: hashedPassword,
      role,
      student_card_number: role === "student" ? student_card_number : null,
    });

    res.status(201).json({
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } created successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT: Update user info (admin only)
exports.updateUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const { name, surname, email, password, role, student_card_number } =
      req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates = {
      name: name ?? user.name,
      surname: surname ?? user.surname,
      email: email ?? user.email,
      role: role ?? user.role,
      student_card_number:
        role === "student"
          ? student_card_number ?? user.student_card_number
          : null,
    };

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    await user.update(updates);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

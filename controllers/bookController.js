const { Book } = require("../models");

exports.addBook = async (req, res) => {
  try {
    // role=libraine
    if (req.user.role !== "librarian") {
      return res.status(403).json({ message: "matnajamch tzid kteb  " });
    }

    const { title, author, theme, reference_code } = req.body;

    if (!title || !author || !theme || !reference_code) {
      return res.status(400).json({ message: "3abi les champs lkoll" });
    }

    const existing = await Book.findOne({ where: { reference_code } });
    if (existing) {
      return res
        .status(409)
        .json({ message: "lkteb hetha bil référence hathy déja mawjoud" });
    }

    const book = await Book.create({
      title,
      author,
      theme,
      reference_code,
      status: "available",
    });

    res.status(201).json({ message: "zid kteb", book });
  } catch (err) {
    console.error("fama mochkel fil ajout ", err);
    res.status(500).json({ message: "fama mochkla o5ra fil serveur" });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (err) {
    console.error("Fetch books error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.searchByTheme = async (req, res) => {
  try {
    const { theme } = req.query;
    if (!theme) return res.status(400).json({ message: "Theme is required" });

    const books = await Book.findAll({ where: { theme } });
    res.json(books);
  } catch (err) {
    console.error("Search theme error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.searchByReference = async (req, res) => {
  try {
    const { reference_code } = req.params;

    const book = await Book.findOne({ where: { reference_code } });
    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json(book);
  } catch (err) {
    console.error("Search ref error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

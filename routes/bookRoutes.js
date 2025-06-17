const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware); // protect all routes

router.post("/", bookController.addBook); // librarian only
router.get("/", bookController.getAllBooks);
router.get("/search", bookController.searchByTheme);
router.get("/:reference_code", bookController.searchByReference);
router.delete("/:reference_code", bookController.deleteBook); // librarian only

module.exports = router;

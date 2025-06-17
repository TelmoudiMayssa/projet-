const { Loan, Book, User } = require('../models');
const { Op } = require('sequelize');

// Borrow a book (only students)
exports.borrowBook = async (req, res) => {
  try {
    const { book_id } = req.body;

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can borrow books' });
    }

    const book = await Book.findByPk(book_id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.status === 'borrowed') {
      return res.status(400).json({ message: 'Book is already borrowed' });
    }

    const existingLoan = await Loan.findOne({
      where: {
        user_id: req.user.id,
        book_id,
        returned: false
      }
    });
    if (existingLoan) {
      return res.status(400).json({ message: 'You already borrowed this book' });
    }

    const today = new Date();
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 10);

    await Loan.create({
      user_id: req.user.id,
      book_id,
      borrow_date: today,
      return_date: returnDate,
      returned: false
    });

    await book.update({ status: 'borrowed' });

    res.status(201).json({ message: 'Book borrowed successfully', due: returnDate });
  } catch (err) {
    console.error('Borrow error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Return a book by reference_code (only librarians)
exports.returnBook = async (req, res) => {
  try {
    const { reference_code } = req.params;

    if (req.user.role !== 'librarian') {
      return res.status(403).json({ message: 'Only librarians can return books' });
    }

    const book = await Book.findOne({ where: { reference_code } });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const loan = await Loan.findOne({
      where: { book_id: book.id, returned: false }
    });

    if (!loan) return res.status(404).json({ message: 'No active loan for this book' });

    await loan.update({ returned: true });
    await book.update({ status: 'available' });

    res.json({ message: 'Book marked as returned' });
  } catch (err) {
    console.error('Return error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all overdue loans (only librarians)
exports.getOverdueLoans = async (req, res) => {
  try {
    if (req.user.role !== 'librarian') {
      return res.status(403).json({ message: 'Only librarians can see overdue books' });
    }

    const today = new Date();
    const overdue = await Loan.findAll({
      where: {
        returned: false,
        return_date: { [Op.lt]: today }
      },
      include: [{ model: Book }, { model: User }]
    });

    res.json(overdue);
  } catch (err) {
    console.error('Overdue error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all loans of a specific user
exports.getLoansByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.role === 'student' && req.user.id != userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const loans = await Loan.findAll({
      where: { user_id: userId },
      include: [{ model: Book }]
    });

    res.json(loans);
  } catch (err) {
    console.error('Fetch user loans error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/borrow', loanController.borrowBook);
router.put('/return/:reference_code', loanController.returnBook);
router.get('/overdue', loanController.getOverdueLoans);
router.get('/user/:userId', loanController.getLoansByUser);


module.exports = router;

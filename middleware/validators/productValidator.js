const { check, validationResult } = require('express-validator');

exports.validateProduct = [
  check('name')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('name can not be empty!'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];
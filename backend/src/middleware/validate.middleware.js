/**
 * Express middleware to validate request bodies using validator functions.
 * @param {Function} validatorFn - The validator function returning { isValid, errors }
 */
export const validateBody = (validatorFn) => {
  return (req, res, next) => {
    const { isValid, errors } = validatorFn(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

export default validateBody;

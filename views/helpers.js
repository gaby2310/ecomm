module.exports = {
  getError(errors, prop) {
    //prop === email || password || passwordConfirmation
    try {
      return errors.mapped()[prop].msg;
    } catch (err) {
      return '';
    }
  },
  //  errors.mapped() gives object from 'errors' message:
  // {
  //     email: {
  //         msg: 'Invalid email'
  //     },
  //     password: {
  //         msg:'Password too short'
  //     },
  //     passwordConfirmation: {
  //         msg: 'Password must match'
  //     }
  // }
};

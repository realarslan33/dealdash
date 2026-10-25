const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_PATTERN = /^(?=.*\p{L})(?=.*\p{N}).{8,}$/u;

const validateRegistration = ({ name, email, password }) => {
  if (name.trim().length < 2 || name.trim().length > 80 || !/\p{L}/u.test(name)) {
    return "Please enter a valid name (2 to 80 characters).";
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  if (!PASSWORD_PATTERN.test(password)) {
    return "Password must be at least 8 characters and include a letter and a number.";
  }
  return null;
};

export default validateRegistration;

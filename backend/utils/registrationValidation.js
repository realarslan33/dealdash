const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_PATTERN = /^(?=.*\p{L})(?=.*\p{N}).{8,}$/u;

const validateRegistration = ({ name, email, password }) => {
  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 80 ||
    !/\p{L}/u.test(name)
  ) {
    return "Please enter a valid name (2 to 80 characters).";
  }
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  if (typeof password !== "string" || !PASSWORD_PATTERN.test(password)) {
    return "Password must be at least 8 characters and include a letter and a number.";
  }
  return null;
};

module.exports = validateRegistration;

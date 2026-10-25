const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sendMail = require("./sendMail");

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const createPasswordReset = async (Model, email, accountType) => {
  const account = await Model.findOne({ email });
  if (!account) return;

  const token = crypto.randomBytes(32).toString("hex");
  account.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  account.resetPasswordTime = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await account.save();

  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
  const resetUrl = `${frontendUrl}/reset-password/${token}?type=${accountType}`;

  try {
    await sendMail({
      email: account.email,
      subject: "Reset your password",
      message: `A password reset was requested for your account. This link expires in one hour and can only be used once:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    });
  } catch (error) {
    account.resetPasswordToken = undefined;
    account.resetPasswordTime = undefined;
    await account.save();
    throw error;
  }
};

const resetPassword = async (Model, token, password) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const hashedPassword = await bcrypt.hash(password, 10);
  const account = await Model.findOneAndUpdate(
    {
      resetPasswordToken: hashedToken,
      resetPasswordTime: { $gt: new Date() },
    },
    {
      $set: { password: hashedPassword },
      $unset: { resetPasswordToken: 1, resetPasswordTime: 1 },
    },
    { new: true, runValidators: true }
  );
  return Boolean(account);
};

module.exports = { createPasswordReset, resetPassword };

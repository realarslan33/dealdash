const sendMail = async (options) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY and RESEND_FROM_EMAIL must be configured to send email.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [options.email],
      subject: options.subject,
      text: options.message,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Resend returned HTTP ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = error?.message || error?.name || errorMessage;
    } catch (_error) {
      // Keep the HTTP status message when the API response is not JSON.
    }
    throw new Error(`Resend failed to send email: ${errorMessage}`);
  }
};

module.exports = sendMail;

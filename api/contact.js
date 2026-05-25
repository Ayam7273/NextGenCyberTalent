import nodemailer from "nodemailer";

export default async function handler(req, res) {

  // ONLY ALLOW POST REQUESTS
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {

    // GET FORM DATA
    const {
      firstName,
      lastName,
      email,
      enquiryType,
      message,
    } = req.body;

    // VALIDATION
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields",
      });
    }

    // CREATE MAIL TRANSPORTER
    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // VERIFY SMTP
    await transporter.verify();

    // SAFE VALUES
    const safeFirstName = String(firstName).trim();
    const safeLastName = String(lastName).trim();
    const safeEmail = String(email).trim();
    const safeMessage = String(message).trim();
    const safeEnquiry = enquiryType || "General Enquiry";

    // ADMIN EMAIL TEMPLATE
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; line-height:1.7; color:#111;">

        <h2 style="color:#0b5d3b;">
          New Website Contact Message
        </h2>

        <table 
          style="
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
          "
        >

          <tr>
            <td style="border:1px solid #ddd; padding:10px;">
              <strong>First Name</strong>
            </td>

            <td style="border:1px solid #ddd; padding:10px;">
              ${safeFirstName}
            </td>
          </tr>

          <tr>
            <td style="border:1px solid #ddd; padding:10px;">
              <strong>Last Name</strong>
            </td>

            <td style="border:1px solid #ddd; padding:10px;">
              ${safeLastName}
            </td>
          </tr>

          <tr>
            <td style="border:1px solid #ddd; padding:10px;">
              <strong>Email Address</strong>
            </td>

            <td style="border:1px solid #ddd; padding:10px;">
              ${safeEmail}
            </td>
          </tr>

          <tr>
            <td style="border:1px solid #ddd; padding:10px;">
              <strong>Enquiry Type</strong>
            </td>

            <td style="border:1px solid #ddd; padding:10px;">
              ${safeEnquiry}
            </td>
          </tr>

          <tr>
            <td style="border:1px solid #ddd; padding:10px;">
              <strong>Message</strong>
            </td>

            <td style="border:1px solid #ddd; padding:10px;">
              ${safeMessage}
            </td>
          </tr>

        </table>

      </div>
    `;

    // SEND EMAIL TO ADMIN
    await transporter.sendMail({

      from: `"GCTI Website" <${process.env.SMTP_USER}>`,

      to: process.env.RECEIVER_EMAIL,

      replyTo: safeEmail,

      subject: `New Contact Form - ${safeEnquiry}`,

      html: adminHtml,
    });

    // AUTO RESPONSE EMAIL
    await transporter.sendMail({

      from: `"GCTI Team" <${process.env.SMTP_USER}>`,

      to: safeEmail,

      subject: "We Received Your Message",

      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.7;">

          <h2>Hello ${safeFirstName},</h2>

          <p>
            Thank you for contacting the 
            Global Cyber Talent Initiative.
          </p>

          <p>
            We have successfully received your message.
          </p>

          <p>
            Our team will review your enquiry and 
            get back to you as soon as possible.
          </p>

          <br>

          <p>
            Best regards,<br>
            GCTI Team
          </p>

        </div>
      `,
    });

    // SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {

    console.error("CONTACT FORM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
}
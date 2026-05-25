import nodemailer from "nodemailer";

export default async function handler(req, res) {

  // ALLOW ONLY POST
  if (req.method !== "POST") {
    return res.status(405).json({
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
        message: "Please fill all required fields",
      });
    }

    // CREATE SMTP TRANSPORTER
    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ENQUIRY LABEL
    const enquiryLabel = enquiryType || "General Enquiry";

    // EMAIL HTML TEMPLATE
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #111;">
        
        <h2 style="color:#0b5d3b;">
          New Contact Form Message
        </h2>

        <table 
          style="
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
          "
        >
          <tr>
            <td style="border:1px solid #ddd; padding:10px;">
              <strong>First Name</strong>
            </td>

            <td style="border:1px solid #ddd; padding:10px;">
              ${firstName}
            </td>
          </tr>

          <tr>
            <td style="border:1px solid #ddd; padding:10px;">
              <strong>Last Name</strong>
            </td>

            <td style="border:1px solid #ddd; padding:10px;">
              ${lastName}
            </td>
          </tr>

          <tr>
            <td style="border:1px solid #ddd; padding:10px;">
              <strong>Email</strong>
            </td>

            <td style="border:1px solid #ddd; padding:10px;">
              ${email}
            </td>
          </tr>

          <tr>
            <td style="border:1px solid #ddd; padding:10px;">
              <strong>Enquiry Type</strong>
            </td>

            <td style="border:1px solid #ddd; padding:10px;">
              ${enquiryLabel}
            </td>
          </tr>

          <tr>
            <td style="border:1px solid #ddd; padding:10px;">
              <strong>Message</strong>
            </td>

            <td style="border:1px solid #ddd; padding:10px;">
              ${message}
            </td>
          </tr>
        </table>

      </div>
    `;

    // SEND EMAIL TO YOU
    await transporter.sendMail({
      from: `"GCTI Website" <${process.env.SMTP_USER}>`,

      to: "afeezalawonde@gmail.com", // CHANGE THIS

      replyTo: fields.email || process.env.SMTP_USER,

      subject: `New Contact Form - ${enquiryLabel}`,

      html,
    });

    // AUTO RESPONSE TO USER
    await transporter.sendMail({
      from: `"GCTI Team" <${process.env.SMTP_USER}>`,

      to: email,

      subject: "We received your message",

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.7;">
          
          <h2>Hello ${firstName},</h2>

          <p>
            Thank you for contacting the 
            Global Cyber Talent Initiative.
          </p>

          <p>
            We have received your message and 
            our team will respond as soon as possible.
          </p>

          <p>
            Kind regards,<br>
            GCTI Team
          </p>

        </div>
      `,
    });

    // SUCCESS RESPONSE
    return res.status(200).json({
      message: "Message sent successfully",
    });

  } catch (error) {

    console.error("CONTACT FORM ERROR:", error);

    return res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
}
import nodemailer from "nodemailer";
import { IncomingForm } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // ALLOW ONLY POST
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  // PARSE FORM DATA
  const form = new IncomingForm({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("FORM ERROR:");
        console.error(err);
        console.error(err.stack);

      return res.status(500).json({
        message: "Form parsing failed",
      });
    }

    try {
      // SMTP TRANSPORT
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // VERIFY SMTP CONNECTION
      await transporter.verify();

      // FILE ATTACHMENT
      let attachments = [];

      if (files.sponsorshipFile) {
        const file = Array.isArray(files.sponsorshipFile)
          ? files.sponsorshipFile[0]
          : files.sponsorshipFile;

        attachments.push({
          filename: file.originalFilename || "attachment",
          content: fs.createReadStream(file.filepath),
        });
      }

      // HANDLE AFFORDABILITY CHECKBOXES
      let affordabilityValues = [];

      if (fields.affordability) {
        affordabilityValues = Array.isArray(fields.affordability)
          ? fields.affordability
          : [fields.affordability];
      }

      // EMAIL HTML TEMPLATE
      const html = `
        <div style="font-family: Arial, sans-serif; line-height:1.6;">
          <h2 style="color:#0f766e;">
            New Global Cyber Talent Application
          </h2>

          <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse: collapse;">
            
            <tr>
              <td><strong>Full Name</strong></td>
              <td>${fields.fullName || ""}</td>
            </tr>

            <tr>
              <td><strong>Email</strong></td>
              <td>${fields.email || ""}</td>
            </tr>

            <tr>
              <td><strong>Phone</strong></td>
              <td>${fields.phone || "Not provided"}</td>
            </tr>

            <tr>
              <td><strong>Experience Level</strong></td>
              <td>${fields.experienceLevel || ""}</td>
            </tr>

            <tr>
              <td><strong>Motivation</strong></td>
              <td>${fields.motivation || ""}</td>
            </tr>

            <tr>
              <td><strong>Start Timeframe</strong></td>
              <td>${fields.startTimeframe || ""}</td>
            </tr>

            <tr>
              <td><strong>Specific Start Date</strong></td>
              <td>${fields.startDateSpecific || "N/A"}</td>
            </tr>

            <tr>
              <td><strong>Funding Status</strong></td>
              <td>${fields.fundingStatus || ""}</td>
            </tr>

            <tr>
              <td><strong>Sponsorship Details</strong></td>
              <td>${fields.sponsorshipDetails || "N/A"}</td>
            </tr>

            <tr>
              <td><strong>Affordability Considerations</strong></td>
              <td>
                ${
                  affordabilityValues.length
                    ? affordabilityValues.join(", ")
                    : "None selected"
                }
              </td>
            </tr>

            <tr>
              <td><strong>Consent Accepted</strong></td>
              <td>${fields.consent ? "Yes" : "No"}</td>
            </tr>

            <tr>
              <td><strong>Declaration Accepted</strong></td>
              <td>${fields.declaration ? "Yes" : "No"}</td>
            </tr>

          </table>

          <br>

          <p>
            Submitted from the GCTI application portal.
          </p>
        </div>
      `;

      // SEND EMAIL
      const info = await transporter.sendMail({
        from: `"GCTI Application Portal" <${process.env.SMTP_USER}>`,
        to: process.env.RECEIVER_EMAIL, // CHANGE THIS
        replyTo: fields.email || process.env.SMTP_USER,
        subject: "New GCTI Application Submission",
        html,
        attachments,
      });

      console.log("APPLICATION EMAIL SENT:", info.messageId);

      // SUCCESS RESPONSE
      return res.status(200).json({
        success: true,
        message: "Application submitted successfully",
      });

    } catch (error) {
      console.error("EMAIL ERROR:", error);

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
}
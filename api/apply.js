import nodemailer from "nodemailer";
import formidable from "formidable";
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

  // PARSE FORM DATA WITH COMPLETE EMPTY-FILE ALLOWANCE RULES
  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowEmptyFiles: true,         // FIX: Stop form parsing failure if empty boundaries are passed
    minFileSize: 0,                // FIX: Support 0-byte structural arguments
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("FORM ERROR:", err);
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

      // Clean string parser to peel out single elements nested in arrays safely
      const getFieldValue = (field) => {
        if (!field) return "";
        return Array.isArray(field) ? field[0] : field;
      };

      // FILE ATTACHMENT WITH EXPANDED SAFEGUARDS FOR OPTIONAL UPLOADS
      let attachments = [];

      if (files.sponsorshipFile) {
        const file = Array.isArray(files.sponsorshipFile)
          ? files.sponsorshipFile[0]
          : files.sponsorshipFile;

        // Check path configurations, sizes, and verify it's not a dummy blank entry before embedding
        if (file && (file.filepath || file.path) && file.size > 0 && file.originalFilename !== "") {
          attachments.push({
            filename: file.originalFilename || file.newFilename || "attachment",
            content: fs.createReadStream(file.filepath || file.path),
          });
        }
      }

      // HANDLE AFFORDABILITY CHECKBOXES
      let affordabilityValues = [];
      const incomingAffordability = fields.affordability;
      if (incomingAffordability) {
        affordabilityValues = Array.isArray(incomingAffordability)
          ? incomingAffordability
          : [incomingAffordability];
      }

      // EMAIL HTML TEMPLATE
      const html = `
        <div style="font-family: Arial, sans-serif; line-height:1.6;">
          <h2 style="color:#0f766e;">
            New Global Cyber Talent Application
          </h2>

          <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse: collapse; border-color: #e2e8f0;">
            
            <tr>
              <td width="30%"><strong>Full Name</strong></td>
              <td>${getFieldValue(fields.fullName)}</td>
            </tr>

            <tr>
              <td><strong>Email</strong></td>
              <td>${getFieldValue(fields.email)}</td>
            </tr>

            <tr>
              <td><strong>Phone</strong></td>
              <td>${getFieldValue(fields.phone) || "Not provided"}</td>
            </tr>

            <tr>
              <td><strong>Experience Level</strong></td>
              <td>${getFieldValue(fields.experienceLevel)}</td>
            </tr>

            <tr>
              <td><strong>Motivation</strong></td>
              <td>${getFieldValue(fields.motivation)}</td>
            </tr>

            <tr>
              <td><strong>Start Timeframe</strong></td>
              <td>${getFieldValue(fields.startTimeframe)}</td>
            </tr>

            <tr>
              <td><strong>Specific Start Date</strong></td>
              <td>${getFieldValue(fields.startDateSpecific) || "N/A"}</td>
            </tr>

            <tr>
              <td><strong>Funding Status</strong></td>
              <td>${getFieldValue(fields.fundingStatus)}</td>
            </tr>

            <tr>
              <td><strong>Sponsorship Details</strong></td>
              <td>${getFieldValue(fields.sponsorshipDetails) || "N/A"}</td>
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
              <td>${getFieldValue(fields.consent) ? "Yes" : "No"}</td>
            </tr>

            <tr>
              <td><strong>Declaration Accepted</strong></td>
              <td>${getFieldValue(fields.declaration) ? "Yes" : "No"}</td>
            </tr>

          </table>

          <br>
          <p style="font-size: 12px; color: #64748b;">
            Submitted from the GCTI application portal.
          </p>
        </div>
      `;

      // SEND EMAIL
      const userEmail = getFieldValue(fields.email);
      const info = await transporter.sendMail({
        from: `"GCTI Application Portal" <${process.env.SMTP_USER}>`,
        to: process.env.RECEIVER_EMAIL, 
        replyTo: userEmail || process.env.SMTP_USER,
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
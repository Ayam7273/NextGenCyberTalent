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

      const userEmail = getFieldValue(fields.email);
      const fullName = getFieldValue(fields.fullName) || "";
      
      // Extract the first name cleanly for the personalized auto-response greeting
      const firstName = fullName.trim().split(" ")[0] || "there";

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

      // ── 1. BRANDED ADMIN NOTIFICATION HTML TEMPLATE ──
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; line-height:1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f766e; padding: 24px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">
              Global Cyber Talent Initiative
            </h2>
            <p style="color: #ccfbf1; margin: 4px 0 0 0; font-size: 14px;">Internal Application Notice</p>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <p style="margin-top: 0; font-size: 15px;">A new candidate application profile has been successfully received through the GCTI portal.</p>
            
            <table border="0" cellpadding="10" cellspacing="0" width="100%" style="border-collapse: collapse; margin-top: 20px; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td width="35%" style="color: #64748b; font-weight: 600; padding: 10px 0;">Full Name</td>
                <td style="color: #0f172a; padding: 10px 0;">${fullName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="color: #64748b; font-weight: 600; padding: 10px 0;">Email Address</td>
                <td style="color: #0f172a; padding: 10px 0;"><a href="mailto:${userEmail}" style="color: #0f766e; text-decoration: none;">${userEmail}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="color: #64748b; font-weight: 600; padding: 10px 0;">Phone Number</td>
                <td style="color: #0f172a; padding: 10px 0;">${getFieldValue(fields.phone) || "Not provided"}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="color: #64748b; font-weight: 600; padding: 10px 0;">Experience Level</td>
                <td style="color: #0f172a; padding: 10px 0; text-transform: capitalize;">${getFieldValue(fields.experienceLevel)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="color: #64748b; font-weight: 600; padding: 10px 0;">Start Timeframe</td>
                <td style="color: #0f172a; padding: 10px 0;">
                  ${getFieldValue(fields.startTimeframe)} ${getFieldValue(fields.startDateSpecific) ? `(${getFieldValue(fields.startDateSpecific)})` : ""}
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="color: #64748b; font-weight: 600; padding: 10px 0;">Funding Status</td>
                <td style="color: #0f172a; padding: 10px 0;">${getFieldValue(fields.fundingStatus)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="color: #64748b; font-weight: 600; padding: 10px 0;">Sponsorship Info</td>
                <td style="color: #0f172a; padding: 10px 0;">${getFieldValue(fields.sponsorshipDetails) || "N/A"}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="color: #64748b; font-weight: 600; padding: 10px 0;">Affordability</td>
                <td style="color: #0f172a; padding: 10px 0;">
                  ${affordabilityValues.length ? affordabilityValues.join(", ") : "None selected"}
                </td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #0f766e;">
              <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px;">Candidate Motivation Statement:</h4>
              <p style="margin: 0; font-size: 13.5px; color: #334155; white-space: pre-line;">"${getFieldValue(fields.motivation)}"</p>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 11px; color: #64748b; margin: 0;">
              Submitted securely from the GCTI application portal.
            </p>
          </div>
        </div>
      `;

      // ── 2. BRANDED CANDIDATE AUTO-RESPONSE HTML TEMPLATE (TAILORED CONTENT) ──
      const autoResponseHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f766e; padding: 32px 24px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">
              Global Cyber Talent Initiative
            </h2>
            <p style="color: #ccfbf1; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Application Update</p>
          </div>
          
          <div style="padding: 32px 24px; background-color: #ffffff;">
            <p style="margin-top: 0; font-size: 15px; color: #1e293b;">Hi ${firstName},</p>
            
            <p style="font-size: 15px; color: #334155;">
              Thank you for applying to the Global Cyber Talent Initiative.
            </p>
            
            <p style="font-size: 15px; color: #334155;">
              We have received your application for the September 2026 cohort and our team will be in touch within 48 hours with the next steps.
            </p>

            <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border-radius: 6px; border-left: 3px solid #0f766e;">
              <h4 style="margin: 0 0 8px 0; color: #0f766e; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">In the meantime, here is what you should know:</h4>
              <p style="margin: 0; font-size: 14px; color: #334155;">
                The September 2026 cohort is a 12-month, structured cybersecurity development programme. You will move through four phases — Foundation, Applied Skills, Project and Collaboration, and Professional Readiness — and graduate with a performance tier that connects you directly to employers looking to hire.
              </p>
            </div>
            
            <p style="font-size: 15px; color: #334155; font-weight: 600; color: #0f766e;">
              No prior experience is required. You made the right decision applying.
            </p>

            <p style="font-size: 14px; color: #64748b; margin-top: 24px;">
              If you have any questions before we get back to you, reply to this email or reach us at <a href="mailto:applications@globalcybertalent.com" style="color: #0f766e; text-decoration: none; font-weight: 600;">applications@globalcybertalent.com</a>
            </p>
            
            <p style="font-size: 15px; color: #334155; margin-top: 28px; margin-bottom: 0;">
              We will be in touch shortly.
            </p>
            
            <p style="font-size: 15px; color: #0f172a; margin-top: 20px; margin-bottom: 0; line-height: 1.4;">
              <strong>The GCTI Team</strong><br>
              <span style="color: #64748b; font-size: 14px;">Global Cyber Talent Initiative</span><br>
              <a href="https://www.globalcybertalent.org" style="color: #0f766e; text-decoration: none; font-size: 14px;">www.globalcybertalent.org</a>
            </p>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">
              © 2026 Global Cyber Talent Initiative. All rights reserved.
            </p>
          </div>
        </div>
      `;

      // ── 3. DISPATCH ADMIN BACKEND NOTIFICATION ──
      const adminMailInfo = await transporter.sendMail({
        from: `"GCTI Application Portal" <${process.env.SMTP_USER}>`,
        to: process.env.RECEIVER_EMAIL, 
        replyTo: userEmail || process.env.SMTP_USER,
        subject: `New GCTI Application Submission - ${fullName}`,
        html: adminHtml,
        attachments,
      });
      console.log("ADMIN APPLICATION NOTIFICATION SENT:", adminMailInfo.messageId);

      // ── 4. DISPATCH CUSTOM AUTO-RESPONSE BACK TO CANDIDATE ──
      if (userEmail) {
        const autoResponseInfo = await transporter.sendMail({
          from: `"The GCTI Team" <${process.env.SMTP_USER}>`,
          to: userEmail,
          subject: "Your GCTI Application — We’ve Received It",
          html: autoResponseHtml,
        });
        console.log("CANDIDATE AUTO-RESPONSE CONFIRMATION SENT:", autoResponseInfo.messageId);
      }

      // SUCCESS RESPONSE
      return res.status(200).json({
        success: true,
        message: "Application submitted successfully",
      });

    } catch (error) {
      console.error("EMAIL SYSTEM ERROR:", error);

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
}
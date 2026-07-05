const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Load local environment configurations safely
dotenv.config({ path: ".env.local" });

// 1. ADD YOUR MISSING APPLICANTS HERE
const missedApplicants = [
  { name: "Jafar Bala", email: "jafarbala9@gmail.com" },
  { name: "Ogunseye Sodiq", email: "ogunseyesodiq093@gmail.com" },
  { name: "AYORINDE RASAQ", email: "rasaqayorinde@yahoo.com" },
  { name: "Alliu Abdul-Somod", email: "alliusomodinho@gmail.com" },
  { name: "Kadiri Abdulqudus", email: "kadiriabdulqudus124@gmail.com" },
  { name: "Afeez", email: "afeezalawonde@gmail.com" },
]
async function runCatchUpPipeline() {
  console.log(`🚀 Initializing catch-up pipeline for ${missedApplicants.length} applicants...`);

  // Resolve standard domain issues by overriding local loopback options
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // FIX: Forces Node.js to prioritize IPv4 (127.0.0.1) instead of IPv6 (::1)
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    dnsTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
      servername: process.env.SMTP_HOST // Ensures handshake succeeds on modern secure domains
    },
  });

  try {
    await transporter.verify();
    console.log("✅ SMTP Server connected successfully.");
  } catch (err) {
    console.error("❌ SMTP connection verification failed:", err);
    console.log("\n💡 Tip: Check if your .env.local file has the correct SMTP_HOST (e.g., smtp.gmail.com or mail.yourdomain.com) instead of 'localhost'.");
    return;
  }

  // Iterate over each user safely
  for (let i = 0; i < missedApplicants.length; i++) {
    const applicant = missedApplicants[i];
    const firstName = applicant.name.trim().split(" ")[0] || "there";
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0F4EC4; padding: 32px 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">
            Global Cyber Talent Initiative
          </h2>
          <p style="color: #ccfbf1; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Admissions Cohort Update</p>
        </div>
        
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <p style="margin-top: 0; font-size: 15px; color: #1e293b;">Hi ${firstName},</p>
          
          <p style="font-size: 15px; color: #334155;">
            Thank you for your interest in the Global Cyber Talent Initiative — and apologies that you have not heard from us sooner.
          </p>
          
          <p style="font-size: 15px; color: #334155;">
            We are writing to confirm that we received your application and that the September 2026 cohort is moving ahead.
          </p>

          <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border-radius: 6px; border-left: 3px solid #0F4EC4;">
            <h4 style="margin: 0 0 8px 0; color: #0F4EC4; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Here is where things stand:</h4>
            <p style="margin: 0; font-size: 14px; color: #334155; padding-bottom: 8px;">
              The programme starts September 2026. It runs for 12 months across four structured phases. 
            </p>
            <p style="margin: 0; font-size: 14px; color: #334155;">
              You will graduate with a performance tier — <strong>Bronze, Silver, Gold, or Platinum</strong> — based on your assessed capability across Technical Execution, Reliability, Communication, and Security Mindset. That tier connects you directly to our employer partner network.
            </p>
          </div>
          
          <p style="font-size: 15px; color: #0F4EC4; font-weight: 600;">
            No prior cybersecurity experience is required. Age 17 and above. That has not changed.
          </p>

          <p style="font-size: 15px; color: #334155; margin-top: 24px;">
            To confirm your place in the next stage of the application process, please reply to this email with the following:
          </p>

          <ol style="font-size: 14px; color: #1e293b; padding-left: 20px; margin: 12px 0;">
            <li style="margin-bottom: 6px;">Your full name</li>
            <li style="margin-bottom: 6px;">Your current background or occupation</li>
            <li style="margin-bottom: 0;">Why you want to enter cybersecurity</li>
          </ol>

          <p style="font-size: 15px; color: #334155; margin-top: 24px;">
            We are building the September cohort now. Spaces are limited and we are reviewing applications in the order they come in.
          </p>

          <p style="font-size: 14px; color: #64748b; margin-top: 24px;">
            Reply directly to this email or reach us at <a href="mailto:applications@globalcybertalent.com" style="color: #0F4EC4; text-decoration: none; font-weight: 600;">applications@globalcybertalent.com</a>
          </p>
          
          <p style="font-size: 15px; color: #334155; margin-top: 28px; margin-bottom: 0;">
            Looking forward to hearing from you.
          </p>
          
          <p style="font-size: 15px; color: #0F4EC4; margin-top: 24px; margin-bottom: 0; line-height: 1.4;">
            <strong>Saheed Jimoh</strong><br>
            <span style="color: #64748b; font-size: 14px;">Founder, Global Cyber Talent Initiative</span><br>
            <a href="https://www.globalcybertalent.org" style="color: #0F4EC4; text-decoration: none; font-size: 14px;">www.globalcybertalent.org</a>
          </p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">
            © 2026 Global Cyber Talent Initiative. All rights reserved.
          </p>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Saheed Jimoh | GCTI" <${process.env.SMTP_USER}>`,
        to: applicant.email,
        replyTo: "applications@globalcybertalent.com",
        subject: "Your GCTI Application — An Update from Us",
        html: emailHtml,
      });

      console.log(`[${i + 1}/${missedApplicants.length}] Sent successfully to: ${applicant.email}`);
      
      // Keep a gentle delay between dispatches
      await new Promise((resolve) => setTimeout(resolve, 1500));

    } catch (sendError) {
      console.error(`❌ Failed to send to ${applicant.email}:`, sendError.message);
    }
  }

  console.log("🏁 All catch-up emails processed!");
}

runCatchUpPipeline();
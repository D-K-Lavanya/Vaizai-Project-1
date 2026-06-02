import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configure the email transporter
 * Note: For production, use a real SMTP service (SendGrid, Mailgun, etc.)
 * For development, we'll use a placeholder/Ethereal mail configuration
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'unga-gmail-id@gmail.com',         // Ungaloda real Gmail Address
    pass: 'abcd efgh ijkl mnop'              // Ungaloda Google account App Password token
  }
});

/**
 * Sends an application confirmation email to the candidate
 * @param {string} to - Candidate's email address
 * @param {string} name - Candidate's name
 * @param {string} jobTitle - The job they applied for
 */
export const sendApplicationConfirmation = async (to, name, jobTitle) => {
  const mailOptions = {
    from: `"VaizAI Recruitment" <${process.env.EMAIL_USER || 'noreply@vaizai.com'}>`,
    to,
    subject: `Application Received: ${jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #10b981;">Application Received!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for applying for the <strong>${jobTitle}</strong> position at our partner company.</p>
        <p>Our AI-powered screening engine is currently reviewing your profile and resume. You will receive an update once the recruiter has reviewed your application.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">This is an automated notification from the VaizAI Recruitment Platform.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent: %s', info.messageId);
    if (transporter.options.host === 'smtp.ethereal.email') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

/**
 * Sends a status update notification to the candidate
 * @param {string} to - Candidate's email address
 * @param {string} name - Candidate's name
 * @param {string} newStatus - The updated status (Shortlisted, Interview, etc.)
 */
export const sendStatusUpdate = async (to, name, newStatus) => {
  const mailOptions = {
    from: `"VaizAI Recruitment" <${process.env.EMAIL_USER || 'noreply@vaizai.com'}>`,
    to,
    subject: `Status Update: Your application has been updated to ${newStatus}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #10b981;">Status Update</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your application status has been updated to: <span style="font-weight: bold; color: #10b981;">${newStatus}</span></p>
        <p>A recruiter will be in touch with you shortly regarding the next steps in the process.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">VaizAI Recruitment Platform - Empowering Careers through Intelligence.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Status update email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
};

const emailService = {
  sendApplicationConfirmation,
  sendStatusUpdate,
};

export default emailService;

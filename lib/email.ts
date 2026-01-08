import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNewUserNotification(userEmail: string, userName?: string) {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'mujtaba@maskingtech.com',
      subject: 'New User Registration - MaskingTech',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #333;">New User Registration</h2>
          <p>A new user has just registered on MaskingTech:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
            ${userName ? `<p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Registered at:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    });
    console.log('New user notification email sent for:', userEmail);
  } catch (error) {
    console.error('Failed to send new user notification email:', error);
    // Don't throw - email notification failure shouldn't break registration
  }
}

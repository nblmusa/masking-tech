//const RESEND_API_KEY = 're_MRttuCAj_JS8zYMip7wYz1Uv6JYn4Vh7H';

export async function sendNewUserNotification(userEmail: string, userName?: string) {
  // try {
  //   console.log('Sending new user notification for:', userEmail, userName);
  //   const response = await fetch('https://api.resend.com/emails', {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${RESEND_API_KEY}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       from: 'onboarding@resend.dev',
  //       to: 'mujtaba@maskingtech.com',
  //       subject: 'New User Registration - MaskingTech',
  //       html: `
  //         <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
  //           <h2 style="color: #333;">New User Registration</h2>
  //           <p>A new user has just registered on MaskingTech:</p>
  //           <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
  //             <p style="margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
  //             ${userName ? `<p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>` : ''}
  //             <p style="margin: 5px 0;"><strong>Registered at:</strong> ${new Date().toLocaleString()}</p>
  //           </div>
  //         </div>
  //       `
  //     }),
  //   });

  //   if (!response.ok) {
  //     const error = await response.json();
  //     console.error('Resend API error:', error);
  //   } else {
  //     console.log('New user notification email sent for:', userEmail);
  //   }
  // } catch (error) {
  //   console.error('Failed to send new user notification email:', error);
  // }
  
  console.log('New user notification skipped for:', userEmail, userName);
  // In production, you would uncomment the above block and use the actual email sending logic
  // to notify admins about new user registrations
}

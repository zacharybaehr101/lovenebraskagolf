import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      sessionId,
      courseName,
      contactName,
      contactEmail,
      contactPhone,
      courseWebsite,
      courseAddress,
      courseDescription,
      driveRange,
      holesCount,
      greensFee,
      photoUrls,
      additionalNotes,
    } = req.body;

    // Verify the Stripe session is actually paid
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(402).json({ error: 'Payment not confirmed' });
    }

    // Build notification email to Zach via Resend (or fallback to console)
    const emailBody = `
NEW FEATURED LISTING CLAIM
===========================
Course Name:     ${courseName}
Contact Name:    ${contactName}
Contact Email:   ${contactEmail}
Contact Phone:   ${contactPhone}
Website:         ${courseWebsite || 'Not provided'}
Address:         ${courseAddress || 'Not provided'}
Holes:           ${holesCount || 'Not provided'}
Greens Fee:      ${greensFee || 'Not provided'}
Driving Range:   ${driveRange ? 'Yes' : 'No'}

Description:
${courseDescription || 'Not provided'}

Photo URLs:
${photoUrls || 'None provided'}

Additional Notes:
${additionalNotes || 'None'}

Stripe Session: ${sessionId}
Customer Email: ${session.customer_details?.email || 'Unknown'}
Amount Paid: $${(session.amount_total / 100).toFixed(2)}
===========================
    `.trim();

    // Send email via Resend if configured, else log
    if (process.env.RESEND_API_KEY) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'LoveNebraskaGolf <noreply@lovenebraskagolf.com>',
          to: ['zacharybaehr@gmail.com'],
          reply_to: contactEmail,
          subject: `New Featured Listing: ${courseName}`,
          text: emailBody,
        }),
      });
      if (!emailRes.ok) {
        console.error('Email send failed:', await emailRes.text());
      }
    } else {
      // Fallback: log to Vercel logs (visible in dashboard)
      console.log('=== NEW LISTING SUBMISSION ===');
      console.log(emailBody);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Submit error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

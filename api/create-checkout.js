import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { courseName, courseCity } = req.body || {};

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        course_name: courseName || '',
        course_city: courseCity || '',
      },
      subscription_data: {
        metadata: {
          course_name: courseName || '',
          course_city: courseCity || '',
        },
      },
      success_url: `${process.env.SITE_URL}/claim/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/claim`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_email: undefined, // let them enter on Stripe page
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

import express from "express";
import Stripe from "stripe";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import { getUserBalance } from "#db/queries/stripe_payments";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.use(requireUser);

// payment intent endpoint
router.post("/create-payment", async (req, res) => {
  try {
    const userId = req.user.id;
    const balance = await getUserBalance(userId);
    if (balance > 0) {
      // create stipe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(balance * 100), // converts to cents
        currency: "usd",
        metadata: {
          userId: userId.toString(),
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: balance,
      });
    } else {
      res.status(400).json({ error: "No balance due." });
    }
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

export default router;

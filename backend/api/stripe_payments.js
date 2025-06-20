// IMPORTANT: This file is loaded before the global JSON parser in app.js.
// Any new route needing a parsed JSON body must include the express.json() middleware itself.
// e.g., router.post('/path', express.json(), handler);

import express from "express";
import Stripe from "stripe";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import {
  getUserBalance,
  recordSuccessfulPayment,
} from "#db/queries/stripe_payments";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    // ------------- REMOVE THIS DEBUG COMMENTS --------------------------
    console.log("Webhook received!");
    console.log("Body type:", typeof req.body);
    console.log("Body constructor:", req.body.constructor.name);
    console.log("Is Buffer?", Buffer.isBuffer(req.body));

    // get signature from headers
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error) {
      console.log("Webhook signature verification failed.", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.log("Recieved webhook event:", event.type);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      // ---------- REMOVE THIS DEBUG --------------
      console.log("Full paymentIntent metadata:", paymentIntent.metadata);
      console.log("User ID from metadata:", paymentIntent.metadata.userId);
      console.log("Unit ID from metadata:", paymentIntent.metadata.unitId);
      console.log(`Payment for ${paymentIntent.amount} was successful.`);

      console.log(`Payment for ${paymentIntent.amount} was successful.`);

      try {
        await recordSuccessfulPayment(paymentIntent);
        console.log(
          `Payment recorded for user ${paymentIntent.metadata.userId}`
        );
      } catch (error) {
        console.error("Error recording payment:", error);
      }
    } else {
      console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

router.use(requireUser);

// payment intent endpoint
router.post("/create-payment", async (req, res) => {
  try {
    const userId = req.user.id;
    const unit = req.user.unit;
    const balance = await getUserBalance(userId);
    if (balance > 0) {
      // create stipe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(balance * 100), // convert to cents (per stripe docsI )
        currency: "usd",
        metadata: {
          userId: userId.toString(),
          unitId: unit.toString(),
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

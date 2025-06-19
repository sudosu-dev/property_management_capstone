import express from "express";
const app = express();

import userRouter from "#api/users";
import propertiesRouter from "#api/properties";
import unitsRouter from "#api/units";
import rentPaymentsRouter from "#api/rent_payments";
import rentChargesRouter from "#api/rent_charges";
import utilitiesRouter from "#api/utility_information";
import announcementsRouter from "#api/announcements";
import maintenanceRouter from "#api/maintenance";
import stripePaymentRouter from "#api/stripe_payments";

import getUserFromToken from "#middleware/getUserFromToken";
import limiter from "#middleware/rateLimiter";

import cors from "cors";

app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(getUserFromToken);

app.use("/users", userRouter);
app.use("/properties", propertiesRouter);
app.use("/units", unitsRouter);
app.use("/rent_payments", rentPaymentsRouter);
app.use("/rent_charges", rentChargesRouter);
app.use("/utilities", utilitiesRouter);
app.use("/announcements", announcementsRouter);
app.use("/maintenance", maintenanceRouter);
app.use("/stripe_payments", stripePaymentRouter);

app.get("/", (req, res) => {
  res.status(200).send("Property Management Capstone!");
});

app.use((err, req, res, next) => {
  switch (err.code) {
    case "22P02":
      return res.status(400).send(err.message);
    case "23505":
    case "23503":
      return res.status(400).send(err.detail);
    default:
      next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});

export default app;

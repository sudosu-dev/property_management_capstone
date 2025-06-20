import pool from "#db/client";
import { getRentPaymentsByUserId } from "./rent_payments.js";
import { getRentChargesByUserId } from "./rent_charges.js";
import { getUtility_informationByUserId } from "./utility_information.js";

export async function getUserBalance(userId) {
  try {
    const [payments, rentCharges, utilityCharges] = await Promise.all([
      getRentPaymentsByUserId(userId),
      getRentChargesByUserId(userId),
      getUtility_informationByUserId(userId),
    ]);

    const totalPayments = payments.reduce(
      (sum, p) => sum - p.payment_amount,
      0
    );

    const totalRentCharges = rentCharges.reduce(
      (sum, r) => sum + parseFloat(r.rent_amount),
      0
    );

    const totalUtilityCharges = utilityCharges.reduce(
      (sum, u) =>
        sum + (u.water_cost || 0) + (u.electric_cost || 0) + (u.gas_cost || 0),
      0
    );

    return totalPayments + totalRentCharges + totalUtilityCharges;
  } catch (error) {
    console.error("Error calculating user balance:", error);
    throw new Error("Failed to calculate balance.");
  }
}

export async function recordSuccessfulPayment(paymentIntent) {
  const userId = paymentIntent.metadata.userId;
  const amount = paymentIntent.amount / 100;
  const stripePaymentId = paymentIntent.id;

  // Find latest unpaid rent charge
  const unpaidCharge = await pool.query(
    "SELECT * FROM rent_payments WHERE user_id = $1 AND paid_date IS NULL ORDER BY due_date DESC LIMIT 1",
    [userId]
  );

  if (unpaidCharge.rows.length > 0) {
    // Update it as paid
    const result = await pool.query(
      "UPDATE rent_payments SET paid_date = CURRENT_TIMESTAMP, receipt_number = $1 WHERE id = $2 RETURNING *",
      [stripePaymentId, unpaidCharge.rows[0].id]
    );
    return result.rows[0];
  } else {
    throw new Error("No unpaid charges found for user");
  }
}

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

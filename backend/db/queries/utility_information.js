import pool from "#db/client";

export async function createUtility_information({
  user_id,
  water_cost,
  water_usage,
  electric_usage,
  electric_cost,
  gas_cost,
  gas_usage,
  due_date,
  paid_date,
}) {
  const sql = `INSERT INTO utility_information(user_id, water_cost, water_usage, electric_usage, electric_cost, gas_cost, gas_usage, due_date, paid_date)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *`;
  const {
    rows: [utility_information],
  } = await pool.query(sql, [
    user_id,
    water_cost,
    water_usage,
    electric_usage,
    electric_cost,
    gas_cost,
    gas_usage,
    due_date,
    paid_date,
  ]);
  return utility_information;
}

export async function getUtility_informationByUserIdAndPaidStatus(user_id) {
  const sql = `SELECT * FROM utility_information
  WHERE user_id = $1 AND paid = false`;
  const {
    rows: [utility_information],
  } = await pool.query(sql, [user_id]);
  return utility_information;
}

export async function getUtility_informationByUserId(user_id) {
  const sql = `SELECT * FROM utility_information
  WHERE user_id = $1`;
  const {
    rows: [utility_information],
  } = await pool.query(sql, [user_id]);
  return utility_information;
}

export async function getAllUtility_information() {
  const sql = `SELECT * FROM utility_information`;
  const { rows: utility_information } = await pool.query(sql);
  return utility_information;
}

export async function updateUtility_informationPaidStatusByUserId(bool) {
  if (bool != false || bool != true) return null;
  const sql = `UPDATE utility_information SET utility_information`;
  const {
    rows: [utility_information],
  } = await pool.query(sql, [bool]);
  return utility_information;
}

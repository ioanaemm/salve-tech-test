const { Pool } = require("pg");

module.exports.handler = async (event) => {
  console.log("event = ", event);
  let path = event.requestContext.http.path;
  let body;
  let statusCode = 200;

  const pool = createPool();

  if (path === "/clinics") {
    body = await listClinics(pool);
  } else if (path.startsWith("/clinics/")) {
    let clinicId = path.split("/")[2].trim();
    if (path.endsWith("/patients")) {
      body = await listPatientsByClinic(pool, clinicId);
    } else {
      statusCode = 404;
    }
  } else {
    statusCode = 404;
  }

  await pool.end();

  let response = {
    statusCode,
    body,
  };
  return response;
};

async function listPatientsByClinic(pool, clinicId) {
  const query = `SELECT * FROM patients WHERE clinic_id='${clinicId}'`;
  return (await pool.query(query)).rows;
}

async function listClinics(pool) {
  const query = `SELECT * FROM clinics`;
  return (await pool.query(query)).rows;
}

function createPool() {
  return new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}

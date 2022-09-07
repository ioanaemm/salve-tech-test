const AWS = require("aws-sdk");
const { SIGUSR2 } = require("constants");
const { Pool } = require("pg");

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
const BUCKET_NAME = "salve-interview20220905160237221800000001";

async function initialiseTables(pool) {
  try {
    await pool.query(`DROP TABLE clinics`);
  } catch (error) {
    console.log("error deleting the table clinics", error);
  }
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS clinics (
      id serial PRIMARY KEY,
      name VARCHAR ( 50 ) NOT NULL
    );`);
  } catch (error) {
    console.log("error creating table clinics:", error);
  }

  try {
    await pool.query(`DROP TABLE patients`);
  } catch (error) {
    console.log("error deleting the table patients", error);
  }

  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id serial PRIMARY KEY,
      clinic_id VARCHAR ( 50 ) NOT NULL,
      first_name VARCHAR ( 50 ) NOT NULL,
      last_name VARCHAR ( 50 ) NOT NULL,
      date_of_birth VARCHAR ( 50 ) NOT NULL
    )
    `);
  } catch (error) {
    console.log("error creating the patients table:", error);
  }
}

async function insertClinics(pool, neatCsv) {
  let clinicsS3Params = {
    Bucket: BUCKET_NAME,
    Key: "data-for-import/clinics.csv",
  };

  const clinicsCsvBuffer = await s3.getObject(clinicsS3Params).promise();
  const clinicsCsvString = clinicsCsvBuffer.Body.toString();
  const clinics = await neatCsv(clinicsCsvString);

  for (let clinic of clinics) {
    try {
      let query = `
      INSERT INTO 
        clinics (name)
      VALUES 
        ('${clinic.name}');`;

      await pool.query(query);
    } catch (error) {
      console.log("error when inserting clinic:", error);
    }
  }
}

async function insertPatients(pool, neatCsv) {
  let patients1S3Params = {
    Bucket: BUCKET_NAME,
    Key: "data-for-import/patients-1.csv",
  };

  let patients2S3Params = {
    Bucket: BUCKET_NAME,
    Key: "data-for-import/patients-2.csv",
  };

  const patients1CsvBuffer = await s3.getObject(patients1S3Params).promise();
  const patients1CsvString = patients1CsvBuffer.Body.toString();
  const patients1 = await neatCsv(patients1CsvString);

  const patients2CsvBuffer = await s3.getObject(patients2S3Params).promise();
  const patients2CsvString = patients2CsvBuffer.Body.toString();
  const patients2 = await neatCsv(patients2CsvString);

  const patients = [...patients1, ...patients2];

  for (let patient of patients) {
    try {
      let query = `
      INSERT INTO 
        patients (clinic_id, first_name, last_name, date_of_birth)
      VALUES
        ('${patient.clinic_id}', '${patient.first_name.split("'").join("''")}', '${patient.last_name
        .split("'")
        .join("''")}', '${patient.date_of_birth}');
      `;

      await pool.query(query);
    } catch (error) {
      console.log("error when inserting patient:", error);
      throw error;
    }
  }
}

module.exports.handler = async (event) => {
  const { default: neatCsv } = await import("neat-csv");

  const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  await initialiseTables(pool);
  await insertClinics(pool, neatCsv);
  await insertPatients(pool, neatCsv);

  await pool.end();
};

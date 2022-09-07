const AWS = require("aws-sdk");
const { Pool } = require("pg");

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
const BUCKET_NAME = "salve-interview20220905160237221800000001";

module.exports.handler = async (event) => {
  const { default: neatCsv } = await import("neat-csv");

  const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await pool.query(`DROP TABLE clinics`);
  } catch (error) {
    console.log("error deleting the table clinics", error);
  }
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS clinics (
      id serial PRIMARY KEY,
      name VARCHAR ( 50 ) UNIQUE NOT NULL
    );`);
  } catch (error) {
    console.log("error creating table clinics:", error);
  }
  await pool.end();

  let clinicsS3Params = {
    Bucket: BUCKET_NAME,
    Key: "data-for-import/clinics.csv",
  };

  let patients1S3Params = {
    Bucket: BUCKET_NAME,
    Key: "data-for-import/patients-1.csv",
  };

  let patients2S3Params = {
    Bucket: BUCKET_NAME,
    Key: "data-for-import/patients-2.csv",
  };

  const clinicsCsvBuffer = await s3.getObject(clinicsS3Params).promise();
  const clinicsCsvString = clinicsCsvBuffer.Body.toString();
  console.log("clinicsCsvString", clinicsCsvString);
  const clinics = await neatCsv(clinicsCsvString);
  console.log("clinics = ", clinics);

  // let clinicsData = await s3.getObject(clinicsS3Params).promise();
};

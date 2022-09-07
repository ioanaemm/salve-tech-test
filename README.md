# Salve interview challenge

## Live URL:

http://salve-interview-static-website.s3-website.eu-west-2.amazonaws.com/

![Demo](https://salve-interview-static-website.s3.eu-west-2.amazonaws.com/demo.gif)

![Cypress](https://salve-interview-static-website.s3.eu-west-2.amazonaws.com/cypress.gif)

(cypress.gif "Testing with Cypress")

---

## Architecture

Despite this being a simple application, I wanted it to be as close to production-level as possible. For that reason, I've tried to replicate a real setup from the infrastructure point of view.

- All the infrastructure is created & managed by Terraform
- Database: given that Salve uses PostgresQL, I opted for an RDS database with Postgres compatibility
- Seed data: the .csv files have been uploaded to an S3 file, from which a Lambda function inserts their contents into the database. The same Lambda function is also responsible for dropping the existing tables and recreating them, thus creating a clean & reproducible data set - this is very useful in a situation where we want to test the system in a deterministic manner.
- API: the API layer is provided by a Lambda function which uses the new "Function URLs" feature offered by AWS. This way, we don't need to use API Gateway.
- Front-end: this is built with Create React App and deployed to an S3 bucket configured to serve a static website

## Design

Trying to be as efficient as possible, I've opted to use a component library. My component library of choice was Ant Design, which I've slightly re-skinned to look more like the Salve brand (colours, border radius and font family).

Given that the brief is not specific about the way that the application should look, I've tried to make it look similar to the Salve brand.

## Testing

I've used Cypress to add E2E tests, which I believe cover the critical functionality of the application.

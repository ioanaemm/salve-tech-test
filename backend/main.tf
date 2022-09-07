terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.29"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = "eu-west-2"
}

resource "aws_s3_bucket" "salve_interview" {
  bucket_prefix = var.bucket_prefix
  acl    = "public-read"

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

resource "aws_s3_bucket_policy" "salve_interview" {
  bucket = aws_s3_bucket.salve_interview.id

  policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::${aws_s3_bucket.salve_interview.id}/*"
            ]
        }
    ]
}
POLICY
}

locals {
  s3_origin_id = "salve_interview"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

resource "aws_subnet" "main" {
  vpc_id     = aws_vpc.main.id
  availability_zone = "eu-west-2a"
  cidr_block = "10.0.1.0/24"
}

resource "aws_subnet" "secondary" {
  vpc_id     = aws_vpc.main.id
  availability_zone = "eu-west-2b"
  cidr_block = "10.0.2.0/24"
}


resource "aws_db_subnet_group" "main" {
  name       = "main"
  subnet_ids = [aws_subnet.main.id, aws_subnet.secondary.id]
}


resource "aws_security_group" "main" {
  vpc_id = aws_vpc.main.id

  ingress {
    protocol  = -1
    self      = true
    from_port = 0
    to_port   = 0
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}



data "archive_file" "lambda_salve" {
  type = "zip"

  source_dir  = "${path.module}/api"
  output_path = "${path.module}/api.zip"
}

resource "aws_s3_object" "lambda_salve" {
  bucket = aws_s3_bucket.salve_interview.id

  key    = "api.zip"
  source = data.archive_file.lambda_salve.output_path

  etag = filemd5(data.archive_file.lambda_salve.output_path)
}

resource "aws_lambda_function" "api" {
  function_name = "api"

  s3_bucket = aws_s3_bucket.salve_interview.id
  s3_key    = aws_s3_object.lambda_salve.key

  runtime = "nodejs16.x"
  handler = "index.handler"
  timeout = "10"
  memory_size = 3072

  source_code_hash = data.archive_file.lambda_salve.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  environment  {
    variables = {
      DB_HOST=aws_db_instance.default.address
      DB_PORT=aws_db_instance.default.port
      DB_DATABASE=var.database_name
      DB_USERNAME=var.database_username
      DB_PASSWORD=var.database_password
    }
  }
}

resource "aws_lambda_function_url" "api" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"
  

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["date", "keep-alive"]
    expose_headers    = ["keep-alive", "date"]
    max_age           = 86400
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name = "/aws/lambda/${aws_lambda_function.api.function_name}"

  retention_in_days = 30
}






resource "aws_cloudwatch_log_group" "data-import" {
  name = "/aws/lambda/${aws_lambda_function.data-import.function_name}"

  retention_in_days = 30
}

resource "aws_lambda_function" "data-import" {
  function_name = "data-import"

  s3_bucket = aws_s3_bucket.salve_interview.id
  s3_key    = aws_s3_object.data-import.key

  runtime = "nodejs16.x"
  handler = "index.handler"
  timeout = "10"
  memory_size = 3072

  source_code_hash = data.archive_file.data-import.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  environment  {
    variables = {
      DB_HOST=aws_db_instance.default.address
      DB_PORT=aws_db_instance.default.port
      DB_DATABASE=var.database_name
      DB_USERNAME=var.database_username
      DB_PASSWORD=var.database_password
    }
  }
}


data "archive_file" "data-import" {
  type = "zip"

  source_dir  = "${path.module}/data-import"
  output_path = "${path.module}/data-import.zip"
}

resource "aws_s3_object" "data-import" {
  bucket = aws_s3_bucket.salve_interview.id

  key    = "data-import.zip"
  source = data.archive_file.data-import.output_path

  etag = filemd5(data.archive_file.data-import.output_path)
}

resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_policy_vpc" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}


resource "aws_db_instance" "default" {
  allocated_storage    = 10
  engine               = "postgres"
  engine_version       = "13.7"
  instance_class       = "db.t3.micro"
  db_name              = var.database_name
  username             = var.database_username
  password             = var.database_password
  skip_final_snapshot  = true
  publicly_accessible  = true
}
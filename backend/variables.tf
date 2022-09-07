variable "bucket_prefix" {
  type        = string
  description = "Name of the s3 bucket to be created."
  default     = "salve-interview"
}
variable "bucket_prefix_frontend" {
  type        = string
  description = "Name of the s3 bucket to be created."
  default     = "salve-frontend"
}

variable "region" {
  type        = string
  default     = "eu-west-2"
  description = "Name of the s3 bucket to be created."
}

variable "database_name" {
  type        = string
  default     = "master"
}
variable "database_username" {
  type        = string
  default     = "master"
}

variable "database_password" {
  type        = string
  default     = "SJqXc7*5cvO9dTOMNq!GPEe!1YNNwYfvS^9wiLynNfXZ3N&y32"
}

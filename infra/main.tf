terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = "us-west-1"
}

resource "aws_s3_bucket" "source_code" {
  bucket = "www.johnglendsiy.me"
}

resource "aws_acm_certificate" "terraform_website_cert" {
  domain_name       = "www.johnglendsiy.me"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_zone" "terraform_hosted_zone" {
  name = "johnglendsiy.me"
}

resource "aws_dynamodb_table" "terraform_visitor_count_db" {
  name           = "visitor-count"
  hash_key       = "id"  # Change this to your table's hash key
  billing_mode   = "PAY_PER_REQUEST"

  attribute {
    name = "id"
    type = "N"  # Change to your key type (e.g., "S" for string, "N" for number)
  }
}



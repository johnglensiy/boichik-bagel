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
  alias   = "us-east"
  region  = "us-east-1"
}

provider "aws" {
  alias   = "us-west"
  region  = "us-west-1"
}

resource "aws_acm_certificate" "tf_website_cert" {
  domain_name               = "www.johnglendsiy.me"
  validation_method         = "DNS"
  subject_alternative_names = ["www.johnglendsiy.me"]

  options {
    certificate_transparency_logging_preference = "ENABLED"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_route53_zone" "tf_hosted_zone" {
    name                = "johnglendsiy.me"
    comment             = "Managed by Terraform"

    tags                = {}
}

resource "aws_s3_bucket" "tf_website_bucket" {
  bucket = "www.johnglendsiy.me"
}

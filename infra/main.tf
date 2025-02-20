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



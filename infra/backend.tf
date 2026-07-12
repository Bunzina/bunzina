terraform {
  # Backend parcial: bucket/key/region/use_lockfile vêm via
  # -backend-config no `terraform init` (ver .github/workflows/terraform.yml).
  # Lock nativo do S3 (use_lockfile) — o Learner Lab nega DynamoDB.
  backend "s3" {}
}

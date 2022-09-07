resource "aws_s3_bucket" "salve_frontend" {
  bucket_prefix = var.bucket_prefix_frontend
  acl    = "public-read"

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

resource "aws_s3_bucket_object" "dist" {
  for_each = fileset("${path.module}/frontend-build", "*")
  bucket = aws_s3_bucket.salve_frontend.bucket
  key    = "${each.value}"
  source = "${path.module}/frontend-build/${each.value}"
  etag   = filemd5("${path.module}/frontend-build/${each.value}")
  acl    = "public-read" 
}

resource "aws_s3_bucket_policy" "salve_frontend" {  
  bucket = aws_s3_bucket.salve_frontend.id   
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
             "arn:aws:s3:::${aws_s3_bucket.salve_frontend.id}/*"            
          ]        
      }    
    ]
}
POLICY
}
import os
import boto3
import logging
from datetime import datetime
from botocore.exceptions import ClientError, EndpointConnectionError
from botocore.config import Config
from backend.config import load_environment

load_environment()
logger = logging.getLogger("neethivaan.minio")

# Match keys from .env.example and docker-compose
MINIO_ENDPOINT  = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_SECURE     = os.getenv("MINIO_SECURE", "False").lower() == "true"
MINIO_BUCKET     = os.getenv("MINIO_BUCKET", "attachments")

_scheme = "https" if MINIO_SECURE else "http"
MINIO_URL = f"{_scheme}://{MINIO_ENDPOINT}"

try:
    s3_client = boto3.client(
        "s3",
        endpoint_url=MINIO_URL,
        aws_access_key_id=MINIO_ACCESS_KEY,
        aws_secret_access_key=MINIO_SECRET_KEY,
        config=Config(
            signature_version="s3v4",
            connect_timeout=1,
            read_timeout=1,
            retries={"max_attempts": 1},
        ),
        region_name="us-east-1",
    )
except Exception as e:
    print(f"[WARN] MinIO client init failed: {e}")
    s3_client = None


def get_presigned_upload_url(bucket_name: str, object_name: str, expiration: int = 300):
    if not s3_client:
        logger.error("MinIO client unavailable for upload URL: bucket=%s object=%s", bucket_name, object_name)
        return None
    try:
        url = s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": bucket_name, "Key": object_name},
            ExpiresIn=expiration,
        )
        logger.info("Generated upload URL: bucket=%s object=%s exp=%ss", bucket_name, object_name, expiration)
        return url
    except ClientError as e:
        logger.exception("Upload URL generation failed: bucket=%s object=%s", bucket_name, object_name)
        return None


def get_presigned_download_url(bucket_name: str, object_name: str, expiration: int = 3600):
    if not s3_client:
        logger.error("MinIO client unavailable for download URL: bucket=%s object=%s", bucket_name, object_name)
        return None
    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket_name, "Key": object_name},
            ExpiresIn=expiration,
        )
        logger.info("Generated download URL: bucket=%s object=%s exp=%ss", bucket_name, object_name, expiration)
        return url
    except ClientError as e:
        logger.exception("Download URL generation failed: bucket=%s object=%s", bucket_name, object_name)
        return None


def get_object_stream(bucket_name: str, object_name: str):
    if not s3_client:
        logger.error("MinIO client unavailable for get_object: bucket=%s object=%s", bucket_name, object_name)
        return None
    try:
        response = s3_client.get_object(Bucket=bucket_name, Key=object_name)
        logger.info("Fetched object stream: bucket=%s object=%s", bucket_name, object_name)
        return response["Body"]
    except ClientError as e:
        logger.exception("Get object failed: bucket=%s object=%s", bucket_name, object_name)
        return None

def delete_object(bucket_name: str, object_name: str):
    if not s3_client:
        logger.error("MinIO client unavailable for delete: bucket=%s object=%s", bucket_name, object_name)
        return False
    try:
        s3_client.delete_object(Bucket=bucket_name, Key=object_name)
        logger.info("Deleted object: bucket=%s object=%s", bucket_name, object_name)
        return True
    except ClientError as e:
        logger.exception("Delete object failed: bucket=%s object=%s", bucket_name, object_name)
        return False

def ensure_bucket_exists(bucket_name: str):
    if not s3_client:
        return
    try:
        s3_client.head_bucket(Bucket=bucket_name)
        logger.info("Bucket exists: %s", bucket_name)
    except EndpointConnectionError as e:
        # Do not crash app startup when MinIO is temporarily unavailable.
        logger.warning("Endpoint unavailable, skipping bucket check for %s: %s", bucket_name, e)
        return
    except ClientError as e:
        if '404' in str(e):
            try:
                s3_client.create_bucket(Bucket=bucket_name)
                logger.info("Created bucket: %s", bucket_name)
            except Exception as ce:
                logger.exception("Failed to create bucket %s", bucket_name)
        else:
            logger.exception("Bucket check error for %s", bucket_name)
    except Exception as e:
        logger.warning("Bucket check skipped due to startup error for %s: %s", bucket_name, e)


def health_check_minio() -> dict:
    if not s3_client:
        return {"status": "unavailable", "detail": "client-not-initialized"}
    try:
        ensure_bucket_exists(MINIO_BUCKET)
        s3_client.head_bucket(Bucket=MINIO_BUCKET)
        return {"status": "connected", "bucket": MINIO_BUCKET}
    except Exception as exc:
        return {"status": "unavailable", "detail": str(exc)[:200]}


def verify_upload_fetch(bucket_name: str = MINIO_BUCKET) -> dict:
    if not s3_client:
        raise RuntimeError("MinIO client is not initialized")
    ensure_bucket_exists(bucket_name)
    object_name = f"healthcheck/{datetime.utcnow().isoformat()}-probe.txt"
    payload = b"neethivaan-minio-probe"
    s3_client.put_object(Bucket=bucket_name, Key=object_name, Body=payload)
    logger.info("Uploaded probe object: bucket=%s object=%s", bucket_name, object_name)
    response = s3_client.get_object(Bucket=bucket_name, Key=object_name)
    body = response["Body"].read()
    if body != payload:
        logger.error("Probe payload mismatch for object=%s", object_name)
        raise RuntimeError("MinIO upload/fetch validation failed: payload mismatch")
    s3_client.delete_object(Bucket=bucket_name, Key=object_name)
    logger.info("Probe object deleted: bucket=%s object=%s", bucket_name, object_name)
    return {"status": "ok", "bucket": bucket_name, "object": object_name}

if s3_client:
    for b in ["attachments", "lawyers", "reports"]:
        ensure_bucket_exists(b)

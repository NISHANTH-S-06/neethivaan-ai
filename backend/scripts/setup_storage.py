import os
from minio import Minio
from minio.error import S3Error

def setup_minio():
    endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    access_key = os.getenv("MINIO_ACCESS_KEY", "admin")
    secret_key = os.getenv("MINIO_SECRET_KEY", "admin1234")
    secure = os.getenv("MINIO_SECURE", "False").lower() == "true"

    client = Minio(
        endpoint,
        access_key=access_key,
        secret_key=secret_key,
        secure=secure
    )

    buckets = ["attachments", "reports", "lawyers"]

    for bucket in buckets:
        try:
            if not client.bucket_exists(bucket):
                client.make_bucket(bucket)
                print(f"[MINIO] Created bucket: {bucket}")
            else:
                print(f"[MINIO] Bucket already exists: {bucket}")
        except S3Error as e:
            print(f"[MINIO] Error checking/creating bucket {bucket}: {e}")

if __name__ == "__main__":
    setup_minio()

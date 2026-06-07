"""Deploy dist/ folder to Alibaba Cloud OSS static website."""
import os
import sys
import mimetypes
import oss2

DIST_DIR = r"C:\Users\111\ZiWeiPurpleCards\dist"

# Read from environment or .env file
def load_env():
    """Load credentials from environment or .ossenv file."""
    env_file = os.path.join(os.path.dirname(__file__), ".ossenv")
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip().strip('"').strip("'")

    required = ["OSS_ACCESS_KEY_ID", "OSS_ACCESS_KEY_SECRET", "OSS_BUCKET", "OSS_ENDPOINT"]
    missing = [k for k in required if not os.environ.get(k)]
    if missing:
        print(f"Missing credentials: {', '.join(missing)}")
        print("Set them as env vars or create .ossenv file with:")
        for m in missing:
            print(f"  {m}=<value>")
        sys.exit(1)

    return {
        "key": os.environ["OSS_ACCESS_KEY_ID"],
        "secret": os.environ["OSS_ACCESS_KEY_SECRET"],
        "bucket": os.environ["OSS_BUCKET"],
        "endpoint": os.environ["OSS_ENDPOINT"],
    }


CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
}


def main():
    creds = load_env()
    print(f"Connecting to bucket: {creds['bucket']} @ {creds['endpoint']}")

    auth = oss2.Auth(creds["key"], creds["secret"])
    bucket = oss2.Bucket(auth, creds["endpoint"], creds["bucket"])

    # Walk dist/ and upload each file
    uploaded = 0
    for root, dirs, files in os.walk(DIST_DIR):
        for fname in files:
            local_path = os.path.join(root, fname)
            # Compute OSS key (relative path from dist/)
            oss_key = os.path.relpath(local_path, DIST_DIR).replace("\\", "/")

            ext = os.path.splitext(fname)[1].lower()
            content_type = CONTENT_TYPES.get(ext, "application/octet-stream")

            # Set cache headers
            headers = {
                "Content-Type": content_type,
                "Cache-Control": "public, max-age=3600" if ext in (".html",) else "public, max-age=86400",
            }

            print(f"  Uploading: {oss_key} ({content_type})")
            result = bucket.put_object_from_file(oss_key, local_path, headers=headers)

            if result.status == 200:
                uploaded += 1
            else:
                print(f"  FAILED: {oss_key} (status {result.status})")

    print(f"\nDone! {uploaded} files uploaded to {creds['bucket']}")
    print(f"Website should be available at: https://{creds['bucket']}.{creds['endpoint'].replace('oss-', '')}")
    print(f"Or via custom domain: https://yuluzilingpai.fun")


if __name__ == "__main__":
    main()

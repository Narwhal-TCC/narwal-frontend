# Frontend deploy (AWS Academy Learner Lab)

This repo deploys the **React/Vite** UI to the **EC2 edge** (Nginx on port 80) via [`.github/workflows/deploy-aws.yml`](../.github/workflows/deploy-aws.yml).

Infrastructure and API deploy live in the backend repo:

| Topic | Location |
| ----- | -------- |
| AWS doc index | [`narwal-backend/docs/aws/README.md`](https://github.com/narwal-tcc/narwal-backend/blob/master/docs/aws/README.md) |
| Architecture | [`../narwal-backend/docs/aws/architecture.md`](../narwal-backend/docs/aws/architecture.md) |
| Learner Lab ops | [`../narwal-backend/docs/aws/learner-lab-operations.md`](../narwal-backend/docs/aws/learner-lab-operations.md) |

## How deploy works (two steps)

1. **GitHub Actions uploads** the production build to **`s3://<APP_S3_BUCKET>/ui/`** (staging prefix in the **app** bucket — same bucket as models, different prefix).
2. **SSM runs on the EC2 instance** and executes `aws s3 sync s3://<bucket>/ui/ /var/www/narwal/`, then reloads Nginx.

You do not need a separate UI bucket or CloudFront invalidation.

## Production routing (no Vite proxy)

Local dev uses the Vite proxy in [`vite.config.ts`](../vite.config.ts) (`/api` → `localhost:8080`).

In AWS, the **browser origin is the Elastic IP** (`http://<eip>/`). Keep **relative** API paths (`/api/auth/login`, `/api/analyses`). Nginx on EC2 proxies `/api/*` to FastAPI. **Do not** point production builds at `localhost`.

## GitHub Actions setup (narwal-frontend)

Organization secrets on **Narwhal-TCC** (same as backend): `AWS_*`, `APP_BUCKET_NAME`, optional `STATE_BUCKET_NAME`. Details: [github-org-secrets.md](https://github.com/Narwhal-TCC/narwal-backend/blob/master/docs/aws/github-org-secrets.md).

**`deploy-aws.yml`** runs Terraform (`narwal-backend/infra`) then `npm test`, build, S3 sync, and SSM. **`ci.yml`** runs unit tests on PR/push without AWS.

Optional repo variable: `AWS_REGION` (`us-east-1`). Legacy repo variables (`APP_S3_BUCKET`, `EC2_INSTANCE_ID`) are not required when using the deploy pipeline.

## Manual verification

1. Start Lab; ensure EC2 is running and API container is up.
2. Open `terraform output -raw app_public_url` from backend `infra/`.
3. Log in with demo credentials and run one analysis (backend [validation-checklist.md](https://github.com/narwal-tcc/narwal-backend/blob/master/docs/aws/validation-checklist.md)).

## Related backend workflow

API image push, SSM restart, and `/api/health` check: [`narwal-backend/.github/workflows/deploy-aws.yml`](../narwal-backend/.github/workflows/deploy-aws.yml).

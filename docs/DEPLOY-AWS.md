# Frontend deploy (AWS Academy Learner Lab)

This repo ships the **React/Vite** UI to the **S3 UI bucket** behind **CloudFront**, using the workflow at [`.github/workflows/deploy-aws.yml`](../.github/workflows/deploy-aws.yml).

Infrastructure, API deploy, and the full stack diagram live in the backend repo:

| Topic | Location |
| ----- | -------- |
| AWS doc index | [`narwal-backend/docs/aws/README.md`](https://github.com/narwal-tcc/narwal-backend/blob/master/docs/aws/README.md) (or sibling clone: `../narwal-backend/docs/aws/README.md`) |
| Architecture | [`../narwal-backend/docs/aws/architecture.md`](../narwal-backend/docs/aws/architecture.md) |
| Learner Lab ops | [`../narwal-backend/docs/aws/learner-lab-operations.md`](../narwal-backend/docs/aws/learner-lab-operations.md) |
| Terraform outputs | [`../narwal-backend/infra/README.md`](../narwal-backend/infra/README.md) |

## Production routing (no Vite proxy)

Local dev uses the Vite dev-server proxy in [`vite.config.ts`](../vite.config.ts) (`/api` → `localhost:8080` with path rewrite).

In AWS, the **browser origin is CloudFront**. The app must keep calling **relative** paths such as `/api/auth/login` and `/api/analyses`. CloudFront forwards `/api/*` to the EC2 API origin; the default behavior serves this UI from S3. **Do not** point production builds at `localhost` or rely on the dev proxy.

## GitHub Actions setup

Configure **repository secrets** and **variables** on **narwal-frontend** (same Learner Lab session keys as the backend repo):

### Secrets

| Name | Purpose |
| ---- | ------- |
| `AWS_ACCESS_KEY_ID` | Learner Lab access key |
| `AWS_SECRET_ACCESS_KEY` | Learner Lab secret key |
| `AWS_SESSION_TOKEN` | Required when the lab issues temporary session credentials |

Secrets are passed only to `aws-actions/configure-aws-credentials`; the workflow does **not** echo them in logs.

### Variables

| Name | Terraform output | Purpose |
| ---- | ---------------- | ------- |
| `AWS_REGION` | (default `us-east-1`) | Region for S3 and CloudFront API calls |
| `UI_S3_BUCKET` | `ui_bucket_name` | Target bucket for `aws s3 sync dist/` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `cloudfront_distribution_id` | Cache invalidation after deploy |

Optional but recommended on the backend repo for coordinated smoke checks: `CLOUDFRONT_URL` (`cloudfront_domain_name`).

## What the workflow does

On push to `master` / `main` (frontend paths) or **workflow_dispatch**:

1. `npm ci` → `npm test` → `npm run build` (output in `dist/`).
2. `aws s3 sync dist/ s3://$UI_S3_BUCKET/` with `--delete`.
3. CloudFront invalidation for `/index.html` and `/assets/*`.

## Manual verification

1. Start Lab and ensure the API EC2 instance is running (backend deploy or manual bootstrap).
2. Open `https://<cloudfront_domain_name>/` from Terraform output.
3. Log in with seeded demo credentials and run one analysis (see backend [`validation-checklist.md`](https://github.com/narwal-tcc/narwal-backend/blob/master/docs/aws/validation-checklist.md) when available).

## Related backend workflow

API image push, SSM restart, and post-deploy `/api/health` check: [`narwal-backend/.github/workflows/deploy-aws.yml`](../narwal-backend/.github/workflows/deploy-aws.yml).

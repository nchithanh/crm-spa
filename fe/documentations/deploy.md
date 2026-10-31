# Deploy — Beauty CRM FE

Static export → **GitHub Pages** (`nchithanh/crm-spa`). Source: `products/saas/crm-spa/` (app trong `fe/`).

## CI

Workflow: `.github/workflows/deploy-pages.yml` (repo root)

- Trigger: push `main` hoặc `workflow_dispatch`
- Working directory: `fe/`
- Build: `GITHUB_PAGES=true GITHUB_PAGES_BASE_PATH=/crm-spa npm run build:pages` → `fe/out/`
- Deploy: GitHub Actions `deploy-pages`

## GitHub (1 lần)

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. (Tuỳ chọn) Custom domain Cloudflare → bỏ `GITHUB_PAGES_BASE_PATH` trong workflow (`basePath` rỗng)
3. Bật **Enforce HTTPS** khi certificate sẵn sàng

## URL

| Giai đoạn | URL |
| --- | --- |
| Project Pages | https://nchithanh.github.io/crm-spa/ — CI đang set `GITHUB_PAGES_BASE_PATH=/crm-spa` |
| Custom domain | `https://<fqdn>/` — xoá env `GITHUB_PAGES_BASE_PATH` |

## Local artifact (giống CI)

```bash
cd fe
npm run build:pages
# static files in fe/out/
```

`generateStaticParams` xuất ID seed (Spa/Nails/Salon). Refresh URL ID mới (tạo lúc runtime / localStorage) có thể 404 trên Pages.

## Push

```bash
cd products/saas/crm-spa
GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes' git push -u origin HEAD:main
```

# Deploy — Beauty CRM FE

Static export → **GitHub Pages** (`nchithanh/crm-spa`). Source: `products/saas/crm-spa/` (app trong `fe/`).

## CI

Workflow: `.github/workflows/deploy-pages.yml` (repo root)

- Trigger: push `main` hoặc `workflow_dispatch`
- Working directory: `fe/`
- Build: `GITHUB_PAGES=true npm run build:pages` → `fe/out/` (`assetPrefix` / `basePath` **rỗng** vì custom domain là root)
- Deploy: GitHub Actions `deploy-pages`

## GitHub (1 lần)

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Custom domain Cloudflare: `crm-spa.dolphin-software.io.vn` — **không** set `GITHUB_PAGES_BASE_PATH` (file nằm ở `/_next/...`, không `/crm-spa/_next/...`)
3. Bật **Enforce HTTPS** khi certificate sẵn sàng

## URL

| Giai đoạn | URL |
| --- | --- |
| Custom domain (SoT) | https://crm-spa.dolphin-software.io.vn/ |
| Project Pages | https://nchithanh.github.io/crm-spa/ — 301 về custom domain |

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

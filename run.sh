bun i
bun run build
docker compose up -d
bun run db:migrate
pm2 restart ecosystem.config.cjs
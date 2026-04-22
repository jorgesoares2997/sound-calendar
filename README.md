# Sound Calendar

Sistema de gestão de escalas de áudio com notificações via Telegram e e-mail.

## Stack

- Next.js 16 + React 19 + TypeScript
- Supabase Postgres (persistência de `members`, `shifts`, `settings`)
- Server Actions para regras de backend

## Rodar local com pnpm

1. Instale dependências:

```bash
pnpm install
```

2. Crie o arquivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
NEXT_PUBLIC_TEAM_NAME=Sound Team
```

3. Rode o projeto:

```bash
pnpm dev
```

## Setup Supabase (externo)

1. Crie um projeto no Supabase.
2. No projeto criado, copie:
   - Project URL (`Settings > API`)
   - service_role key (`Settings > API`)
3. Instale a CLI:

```bash
pnpm dlx supabase --version
```

4. Faça login:

```bash
pnpm dlx supabase login
```

5. Linke seu projeto local ao Supabase remoto:

```bash
pnpm dlx supabase link --project-ref <SEU_PROJECT_REF>
```

6. Aplique migration do banco:

```bash
pnpm dlx supabase db push
```

Migration usada: `supabase/migrations/202604220001_init_sound_calendar.sql`.

7. Migre os dados atuais do JSON para o banco:

```bash
pnpm db:migrate-json
```

## Deploy na Vercel

Defina as variáveis de ambiente em `Project Settings > Environment Variables`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `NEXT_PUBLIC_TEAM_NAME`
- `CRON_SECRET`

Depois faça o deploy normalmente.

## Automacao de notificacoes (Vercel Cron)

O arquivo `vercel.json` ja configura:

- semanal: segunda-feira as `06:00` (UTC) em `/api/notify/weekly`
- diario: todos os dias as `06:00` (UTC) em `/api/notify/daily`

O endpoint diario so envia notificacao quando houver escala para o dia; caso contrario ele retorna `skipped: true`.

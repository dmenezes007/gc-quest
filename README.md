# Knowledge Gamification

Aplicação Next.js com gamificação de conhecimento (XP, badges, níveis, leaderboard), autenticação Supabase e persistência com Prisma/PostgreSQL.

## Requisitos

- Node.js 20+
- npm 10+
- Banco PostgreSQL acessível
- Projeto Supabase com URL e anon key

## Configuração local

1. Instale dependências:

```bash
npm install
```

2. Crie variáveis de ambiente a partir do exemplo:

```bash
cp .env.example .env.local
```

3. Preencha os valores em `.env.local`:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- opcional: `LOG_LEVEL`

4. Gere cliente Prisma (se necessário):

```bash
npx prisma generate
```

5. Rode em desenvolvimento:

```bash
npm run dev
```

## Scripts

- `npm run dev`: ambiente local
- `npm run build`: build de produção
- `npm run start`: servidor de produção
- `npm run lint`: validação de lint
- `npm run test`: testes unitários (Vitest, modo watch)
- `npm run test -- --run`: testes unitários em execução única
- `npm run e2e`: testes E2E (Playwright)
- `npm run db:seed`: seed de dados com Prisma

## Publicação no GitHub

Checklist antes de subir:

1. `npm run lint`
2. `npm run build`
3. Confirmar que `.env.local` não está versionado
4. Garantir que somente `.env.example` foi commitado

## Deploy na Vercel

1. Importe o repositório na Vercel.
2. Framework preset: `Next.js`.
3. Defina as variáveis de ambiente em **Project Settings → Environment Variables**:
	- `DATABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
	- `LOG_LEVEL` (opcional, recomendado: `info`)
4. Build command: `npm run build`.
5. Install command: `npm install`.
6. Output: padrão do Next.js (sem ajuste manual).

### Observações de produção

- `E2E_MOCK_AUTH` é apenas para testes E2E; não habilitar em produção.
- Se usar migrações Prisma no deploy, execute em pipeline/CI antes de promover para produção.

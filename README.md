# NoSQL MongoDB Operations Demo

Minimal Node.js project demonstrating ~15 MongoDB operations for a NoSQL class.

Files added:
- `package.json` — project manifest
- `src/db.js` — simple MongoDB connection helper
- `src/operations.js` — ~15 example operations (CRUD, aggregation, index, bulk, text search, transaction example)
- `scripts/run.js` — CLI runner to run all or a single operation
- `.env.example` — example environment variables

Quick start (Windows PowerShell):

1) Copy and edit environment file

```
cp .env.example .env
# Then open .env and edit MONGO_URI and DB_NAME if needed
```

2) Install dependencies

```powershell
npm install
```

3) Run the full demo (runs operations in sequence)

```powershell
npm start
```

Or run a single operation by name (e.g. `createOne` or `aggregateSample`):

```powershell
node .\scripts\run.js createOne
```

Notes:
- `transactionExample` requires MongoDB to run as a replica set (even a single-node replica set). If you run a standalone server, that operation may fail; it's included for demonstration.
- The project uses the official `mongodb` driver directly to keep things minimal.
- Add or modify operations in `src/operations.js`. The runner will pick them up automatically.

If you'd like, I can:
- Add a small test file that asserts the happy path results.
- Convert this to TypeScript or add ESLint/Prettier.
- Add an example using MongoDB Atlas.

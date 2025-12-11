# frame-master-plugin-use-api

A [Frame-Master](https://github.com/shpaw415/frame-master) plugin for creating file-system based API routes using the `"use-api"` directive.

## Installation

```bash
bun add frame-master-plugin-use-api
```

## Features

- 📁 **File-system routing** - Create API endpoints based on your folder structure (Next.js style)
- 🏷️ **Directive-based** - Only files with `"use-api"` directive are treated as API routes
- 🔄 **Hot reload** - Automatic route reloading in development mode
- 🛡️ **Build safety** - Prevents API routes from being included in browser builds
- ⚡ **All HTTP methods** - Supports GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD

## Usage

### Configuration

Add the plugin to your `frame-master.config.ts`:

```typescript
import type { FrameMasterConfig } from "frame-master/server/types";
import UseApi from "frame-master-plugin-use-api";

export default {
  HTTPServer: {
    port: 3000,
  },
  plugins: [
    UseApi({
      basePath: "api", // Directory containing your API routes
    }),
  ],
} satisfies FrameMasterConfig;
```

### Creating API Routes

Create files in your `api` directory with the `"use-api"` directive:

```
api/
├── index.ts          → GET /api
├── users/
│   ├── index.ts      → GET /api/users
│   └── [id].ts       → GET /api/users/:id
└── posts/
    └── [...slug].ts  → GET /api/posts/*
```

### Route Handler

Each API file exports functions named after HTTP methods:

```typescript
"use-api";

import type { masterRequest } from "frame-master/server/request";

// GET /api/users
export async function GET(master: masterRequest) {
  const users = await fetchUsers();
  master.setResponse(JSON.stringify(users), {
    headers: { "Content-Type": "application/json" },
  });
}

// POST /api/users
export async function POST(master: masterRequest) {
  const body = await master.request.json();
  const user = await createUser(body);
  master.setResponse(JSON.stringify(user), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}

// DELETE /api/users
export async function DELETE(master: masterRequest) {
  master.setResponse(null, { status: 204 });
}
```

### Dynamic Routes

Use Next.js-style dynamic segments:

```typescript
// api/users/[id].ts
"use-api";

import type { masterRequest } from "frame-master/server/request";

export async function GET(master: masterRequest) {
  // Access route params via URL
  const id = master.URL.pathname.split("/").pop();
  const user = await getUser(id);

  master.setResponse(JSON.stringify(user), {
    headers: { "Content-Type": "application/json" },
  });
}
```

## Plugin Options

| Option               | Type                                          | Required | Description                            |
| -------------------- | --------------------------------------------- | -------- | -------------------------------------- |
| `basePath`           | `string`                                      | ✅       | Directory containing API route files   |
| `onError`            | `(err: Error, master: masterRequest) => void` | ❌       | Custom error handler                   |
| `onMethodNotAllowed` | `(master: masterRequest) => void`             | ❌       | Custom handler for unsupported methods |

### Custom Error Handling

```typescript
UseApi({
  basePath: "api",
  onError: (err, master) => {
    console.error("API Error:", err);
    master.setResponse(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  },
  onMethodNotAllowed: (master) => {
    master.setResponse(JSON.stringify({ error: "Method not supported" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  },
});
```

## Supported HTTP Methods

- `GET`
- `POST`
- `PUT`
- `DELETE`
- `PATCH`
- `OPTIONS`
- `HEAD`

## Requirements

- Frame-Master `>=3.0.1`
- Bun `>=1.2.0`

## License

MIT

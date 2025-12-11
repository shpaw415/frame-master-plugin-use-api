# ${name}

Frame-Master plugin

## Installation

```bash
bun add frame-master-plugin-use-api
```

## Usage

```typescript
import type { FrameMasterConfig } from "frame-master/server/types";
import framemasterpluginuseapi from "frame-master-plugin-use-api";

const config: FrameMasterConfig = {
  HTTPServer: { port: 3000 },
  plugins: [framemasterpluginuseapi()],
};

export default config;
```

## Features

- Feature 1
- Feature 2

## License

MIT

```

```

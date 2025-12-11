import type { FrameMasterPlugin } from "frame-master/plugin/types";
import PackageJson from "./package.json";
import { directiveToolSingleton } from "frame-master/plugin/utils";
import type { masterRequest } from "frame-master/server/request";
import { isDev } from "frame-master/utils";

type useApiPluginOptions = {
  basePath: string;
  onError?: (err: Error, master: masterRequest) => void | Promise<void>;
  onMethodNotAllowed?: (master: masterRequest) => void | Promise<void>;
};

const APIMethods = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
  "HEAD",
] as const;
type APIMethod = (typeof APIMethods)[number];
type APIHandler = (master: masterRequest) => Promise<void> | void;

async function importer(path: string) {
  return (await import(
    isDev() ? path + `?id=${Bun.randomUUIDv7()}` : path
  )) as Partial<Record<APIMethod, APIHandler>>;
}

/**
 * frame-master-plugin-use-api - Frame-Master Plugin
 *
 * Description: Add your plugin description here
 */
export default function useaApiPlugin(
  opt: useApiPluginOptions
): FrameMasterPlugin {
  const { basePath } = opt;

  const fileSystemRouter = new Bun.FileSystemRouter({
    dir: basePath,
    fileExtensions: [".ts", ".js"],
    style: "nextjs",
  });

  return {
    name: PackageJson.name,
    version: PackageJson.version,

    router: {
      request: async (master) => {
        if (master.isResponseSetted()) return;
        const route = fileSystemRouter.match(master.request.url);
        if (!route) return;

        const isApi = await directiveToolSingleton.pathIs(
          "use-api" as any,
          route.filePath
        );
        if (!isApi) return;

        try {
          const mod = await importer(route.filePath);
          const method = master.request.method.toUpperCase() as APIMethod;
          const handler = mod[method];
          if (!handler) {
            if (!opt.onMethodNotAllowed) {
              master.setResponse("Method Not Allowed", { status: 405 });
              return;
            }
            await opt.onMethodNotAllowed?.(master);
            if (!master.isResponseSetted())
              master.setResponse("Method Not Allowed", { status: 405 });
            return;
          }
          await handler(master);
        } catch (err) {
          if (!opt.onError) throw err;
          await opt.onError?.(err as Error, master);
        }
      },
    },

    directives: [
      {
        name: "use-api",
        regex:
          /^(?:\s*(?:\/\/.*?\n|\s)*)?['"]use[-\s]api['"];?\s*(?:\/\/.*)?(?:\r?\n|$)/m,
      },
    ],

    build: {
      buildConfig: {
        plugins: [
          {
            name: "use-api-plugin-remover",
            setup(build) {
              // Example: Remove specific imports during build
              build.onLoad({ filter: /.*\.(ts|js)/ }, async (args) => {
                const fileContent =
                  args.__chainedContents ?? (await Bun.file(args.path).text());

                if (
                  (await directiveToolSingleton.pathIs(
                    "use-api" as any,
                    args.path
                  )) &&
                  build.config.target == "browser"
                ) {
                  throw new Error(
                    `route with directive "use-api" cannot be part of browser build. Found in ${args.path}`
                  );
                }
                return {
                  contents: fileContent,
                  loader: args.__chainedLoader ?? args.loader,
                };
              });
            },
          },
        ],
      },
    },

    requirement: {
      frameMasterVersion: ">=3.0.1",
      bunVersion: ">=1.2.0",
    },
    fileSystemWatchDir: [basePath],
    async onFileSystemChange(ev, relative, absolute) {
      const isUseApi = await directiveToolSingleton.pathIs(
        "use-api" as any,
        absolute
      );
      if (!isUseApi) return;
      fileSystemRouter.reload();
    },
  };
}

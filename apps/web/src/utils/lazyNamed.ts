import type { ComponentType } from "react";
import { lazy } from "react";

export function lazyNamed<
  TModule extends Record<string, unknown>,
  TName extends keyof TModule & string,
>(loader: () => Promise<TModule>, name: TName) {
  return lazy(() =>
    loader().then((module) => ({
      default: module[name] as ComponentType<unknown>,
    }))
  );
}

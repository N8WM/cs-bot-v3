import { readdirSync, lstatSync } from "fs";
import { join, basename } from "path";

export type FNode<T> = {
  name: string;
  parent: string;
  data: T;
};

const isDir = (i: string) => lstatSync(i).isDirectory();
const isJtsFile = (i: string) => i.endsWith(".js") || i.endsWith(".ts");

export async function read<T>(
  dir: string,
  callback: (node: FNode<T>, depth: number) => void,
  depth: number = 0,
) {
  const entries = readdirSync(dir)
    .map((name) => {
      const fpath = join(dir, name);
      return { name, fpath, isDir: isDir(fpath) };
    })
    .filter((item) => item.isDir || isJtsFile(item.name));

  const nodes = await Promise.all(
    entries.map(async ({ name, fpath, isDir }) => ({
      isFile: !isDir,
      name: name.replace(/\.(js|ts)$/, ""),
      parent: basename(dir),
      data: isDir
        ? (await read<T>(fpath, callback, depth + 1), undefined)
        : (await import(fpath)).default,
    })),
  );

  nodes.filter((node) => node.isFile).forEach((node) => callback(node, depth));
}

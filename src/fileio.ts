import fs, { promises as fsPromises } from "fs";
const BASE_PATH = "/Users/vamshi/Dropbox";
export const fullPath = (path: string) => BASE_PATH + "/" + path;

export async function getText(file: string) {
  return await fsPromises.readFile(fullPath(file), "utf8");
}

export async function writeText(file: string, content: string) {
  await fsPromises.writeFile(fullPath(file), content);
}

import { readdir, readFile, stat } from "fs/promises";
import path from "path";

const directory = "./src";

async function searchFiles(dir, keyword) {
  try {
    const files = await readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const fileStat = await stat(filePath);

      if (fileStat.isDirectory()) {
        await searchFiles(filePath, keyword);
      } else if (fileStat.isFile()) {
        const data = await readFile(filePath, "utf8");
        if (data.includes(keyword)) {
          console.log(`Found "${keyword}" in: ${filePath}`);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

searchFiles(directory, "hello");

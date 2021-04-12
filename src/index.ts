import chokidar from 'chokidar';
import { getFileChanges } from './changes';
import { projects } from './config.json';
import { getDB, initDB, DB } from './db';
import { writeText } from './fileio';
import { getFilesToUpdate } from './main';

async function start() {
  try {
    const { files, lines, tags } = await initDB();
    const db: DB = getDB(files, lines);
    chokidar.watch(projects).on('change', async (filePath: string) => {
      console.time('start exec');
      //- get file changes
      const changes = await getFileChanges(filePath, db);
      const filesText = getFilesToUpdate(
        changes,
        filePath,
        lines,
        files,
        tags,
        db
      );
      if (filesText) {
        const responses = await Promise.all(
          filesText.map((fileText) =>
            writeText(fileText.filePath, fileText.text)
          )
        );
        console.log(responses);
      }
      console.timeEnd('start exec');
    });
  } catch (err) {
    console.error(err);
  }
}
start().then(() => console.log('DONE'));

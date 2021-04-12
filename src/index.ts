import chokidar from 'chokidar';
import { getFileChanges } from './commit-changes';
import { projects } from './config.json';
import { getDB, initDB, DB } from './db';
import { writeText } from './fileio';
import { getFilesToUpdate } from './main';

import { diffTrimmedLines } from 'diff';
async function start() {
  try {
    const { files, lines, tags } = await initDB();
    const db: DB = getDB(files, lines);
    chokidar.watch(projects).on('change', async (filePath: string) => {
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

      /**
 yet to do 
 - two-way sync --> take effort to update them manually
 - plugin system ?  --> we can add them slowly
 - text inbetween lists --> use lists everywhere for now
 - block for paragraphs ---> use lists everywhere for now
 - adding negative search wont work on child lists --> Fix this ! 
 */
    });
  } catch (err) {
    console.error(err);
  }
}
start().then(() => console.log('DONE'));

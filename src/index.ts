import chokidar from 'chokidar';
import { getFileChanges } from './commit-changes';
import { projects } from './config.json';
import { createOrGetFile, initDB } from './db';
import { updateLines } from './lines';

async function start() {
  try {
    const { files, lines, tags } = await initDB();
    chokidar.watch(projects).on('change', async (filePath: string) => {
      //- get file changes
      const changes = await getFileChanges(filePath);
      // save changes in db
      updateLines(changes, filePath, lines, files);

      /* 
- get changes
- update lines based on changes
- while adding new line
  - get line type
  - add line to db
  - get tags and add to tags db
- Recreate/update tree structure
  - add child lines to parent line
    - copy hashtags of parents to child lines
- get queries to update
- group changes per file
- delete old references and add new ones
- update the target files and commit them

*/
    });
  } catch (err) {
    console.error(err);
  }
}
start().then(() => console.log('DONE'));

import { Change } from '../changes';
import {
  lineSeperator,
  queryResultBorderEnd,
  queryResultBorderStart,
} from '../config.json';
import { DB, File, getDB, Line, Tags } from '../db';
import { getFilesToUpdate } from '../main';
import { prepareDB } from './lines.test';

/** 
 * 
 Test cases : 
 - [x] query should fetch child tags should too
  parent line #tag1 
    child line #tag2
  +tag1 +tag2
 - [ ] adding just below query response is valid
 - [x] tree structure should also ignore query responses
 - [x] making changes in query responses should be ignored
 - [x] query line updated should update the references 
 - [x] query line deleted should delete the responses too
 - [ ] deleting a simple line is also a change 
 - [ ] inherited tags repeated multiple times, should always be unique
 */
describe('main tests', () => {
  let filesDB: Collection<File>;
  let linesDB: Collection<Line>;
  let tagsDB: Collection<Tags>;
  let db: DB;
  beforeAll(async () => {
    const db1 = await prepareDB();
    filesDB = db1.files;
    linesDB = db1.lines;
    tagsDB = db1.tags;
    db = getDB(filesDB, linesDB);
  });

  test('simple scenario of single file with no tags and queries', () => {
    const newFileContent = `
- line 1
- line 2 
- line 3
`;
    const fileChanges = runtest(
      'file1.md',
      newFileChanges(newFileContent),
      filesDB,
      linesDB,
      tagsDB,
      db
    );
    expect(fileChanges.length).toBe(0);
  });
  test('add a tag and still no files to update', () => {
    //`
    // - line 1
    // - line 2 #tag1
    // - line 3
    // `;
    const fileChanges = runtest(
      'file1.md',
      new Map([
        [2, [{ type: 'del' }, { type: 'add', content: ['- line 2 #tag1'] }]],
      ]),
      filesDB,
      linesDB,
      tagsDB,
      db
    );
    expect(fileChanges.length).toBe(1);
  });
  test('add a query and get file update', () => {
    const fileChanges = runtest(
      'file1.md',
      new Map([[5, [{ type: 'add', content: ['+tag1'] }]]]),
      filesDB,
      linesDB,
      tagsDB,
      db
    );
    expect(fileChanges.length).toBe(1);
    expect(fileChanges[0].text).toBe(`
- line 1
- line 2 #tag1
- line 3

+tag1
${queryResultBorderStart}
- line 2 #tag1

${queryResultBorderEnd}`);
  });
  test('add a tag to existing query and get file update', () => {
    //`
    // - line 1
    // - line 2 #tag1
    // - line 2.1 #tag1
    // - line 3
    //
    // +tag1
    // `;
    const fileChanges = runtest(
      'file1.md',
      new Map([[3, [{ type: 'add', content: ['- line 2.1 #tag1'] }]]]),
      filesDB,
      linesDB,
      tagsDB,
      db
    );
    expect(fileChanges.length).toBe(1);
    expect(fileChanges[0].text).toBe(`
- line 1
- line 2 #tag1
- line 2.1 #tag1
- line 3

+tag1
${queryResultBorderStart}
- line 2 #tag1

- line 2.1 #tag1

${queryResultBorderEnd}`);
  });
  test('add a child to existing tag and existing query and get file update', () => {
    const fileChanges = runtest(
      'file1.md',
      new Map([[4, [{ type: 'add', content: ['  - line 2.1.1'] }]]]),

      filesDB,
      linesDB,
      tagsDB,
      db
    );
    expect(fileChanges.length).toBe(1);
    expect(fileChanges[0].text).toBe(`
- line 1
- line 2 #tag1
- line 2.1 #tag1
  - line 2.1.1
- line 3

+tag1
${queryResultBorderStart}
- line 2 #tag1

- line 2.1 #tag1
  - line 2.1.1

${queryResultBorderEnd}`);
  });

  test('add a child to existing tag  with another tag and existing query ', () => {
    const fileChanges = runtest(
      'file1.md',
      new Map([[5, [{ type: 'add', content: ['  - line 2.1.2 #tag2'] }]]]),
      filesDB,
      linesDB,
      tagsDB,
      db
    );
    expect(fileChanges.length).toBe(1);
    // console.log(fileChanges[0].text);
    expect(fileChanges[0].text).toBe(`
- line 1
- line 2 #tag1
- line 2.1 #tag1
  - line 2.1.1
  - line 2.1.2 #tag2
- line 3

+tag1
${queryResultBorderStart}
- line 2 #tag1

- line 2.1 #tag1
  - line 2.1.1
  - line 2.1.2 #tag2

${queryResultBorderEnd}`);
  });
  test('change query to add multiple tags', () => {
    //`
    // - line 1
    // - line 2 #tag1
    // - line 2.1 #tag1
    // - line 2.1 #tag1
    //   - line 2.1.1
    //   - line 2.1.2 #tag2
    // - line 3
    //
    // +tag1
    // `;
    const fileChanges = runtest(
      'file1.md',
      new Map([
        [1, [{ type: 'add', content: ['- line x #tag1 #tag2'] }]],
        [8, [{ type: 'del' }, { type: 'add', content: ['dummy text'] }]],
        [9, [{ type: 'del' }, { type: 'add', content: ['+tag1 +tag2'] }]],
      ]),
      filesDB,
      linesDB,
      tagsDB,
      db
    );

    expect(fileChanges.length).toBe(1);
    expect(fileChanges[0].text).toBe(`
- line x #tag1 #tag2
- line 1
- line 2 #tag1
- line 2.1 #tag1
  - line 2.1.1
  - line 2.1.2 #tag2
- line 3
dummy text
+tag1 +tag2
${queryResultBorderStart}
  - line 2.1.2 #tag2

- line x #tag1 #tag2

${queryResultBorderEnd}`);
  });
  test('changes in query response should be ignored', () => {
    const fileChanges = runtest(
      'file1.md',
      new Map([
        [10, [{ type: 'del' }, { type: 'add', content: ['sdfasfsf'] }]],
        [12, [{ type: 'del' }, { type: 'add', content: ['sdfasfsf'] }]],
      ]),
      filesDB,
      linesDB,
      tagsDB,
      db
    );

    expect(fileChanges.length).toBe(0);
  });
  test('deleting query should delete results too', () => {
    const fileChanges = runtest(
      'file1.md',
      new Map([[9, [{ type: 'del', content: '- line x #tag1 #tag2' }]]]),
      filesDB,
      linesDB,
      tagsDB,
      db
    );

    expect(fileChanges.length).toBe(1);

    expect(fileChanges[0].text).toEqual(`
- line x #tag1 #tag2
- line 1
- line 2 #tag1
- line 2.1 #tag1
  - line 2.1.1
  - line 2.1.2 #tag2
- line 3
dummy text`);
  });

  test('simple child tag with parent having hash should reflect in query response', () => {
    const changes1 = newFileChanges(
      `- line 1
- line 2 #tag
  - line 33
  - line 34
  - line 35
  - line 36
  
+tag`
    );
    runtest('fil2.md', changes1, filesDB, linesDB, tagsDB, db);
    const fileChanges = runtest(
      'fil2.md',
      new Map([[5, [{ type: 'del', content: 'sdsd' }]]]),
      filesDB,
      linesDB,
      tagsDB,
      db
    );

    expect(fileChanges[0].text).toEqual(
      `- line 1
- line 2 #tag
  - line 33
  - line 34
  - line 35
  
+tag
${queryResultBorderStart}
- line 2 #tag
  - line 33
  - line 34
  - line 35

${queryResultBorderEnd}`
    );
  });
});

function runtest(
  filePath: string,
  changes: Map<number, Change[]>,
  filesDB: Collection<File>,
  linesDB: Collection<Line>,
  tagsDB: Collection<Tags>,
  db: DB
): { filePath: string; text: string }[] {
  try {
    const fl = getFilesToUpdate(
      changes,
      filePath,
      linesDB,
      filesDB,
      tagsDB,
      db
    );
    if (fl) {
      return fl;
    }
    return [];
  } catch (err) {
    return [];
  }
}

function newFileChanges(fileText: string): Map<number, Change[]> {
  const m: Map<number, Change[]> = new Map();
  m.set(0, [{ type: 'add', content: fileText.split(lineSeperator) } as Change]);
  return m;
}

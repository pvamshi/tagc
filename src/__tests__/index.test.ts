import { getFilesToUpdate, log } from '../main';
import { Change } from '../commit-changes/models';
import { Tags, File, Line } from '../db';
import { prepareDB } from './lines.test';
import {
  lineSeperator,
  queryResultBorderStart,
  queryResultBorderEnd,
} from '../config.json';
import { getFileText } from '../lines';

/** 
 * 
 Test cases : 
 - [x] query should fetch child tags should too
  parent line #tag1 
    child line #tag2
  +tag1 +tag2
 - [ ] adding just below query response is valid
 - [ ] tree structure should also ignore query responses
 - [ ] making changes in query responses should be ignored
 - [ ] query line updated should update the references 
 - [ ] query line deleted should delete the responses too
 - 
 */
describe('main tests', () => {
  let filesDB: Collection<File>;
  let linesDB: Collection<Line>;
  let tagsDB: Collection<Tags>;
  beforeAll(async () => {
    const db = await prepareDB();
    filesDB = db.files;
    linesDB = db.lines;
    tagsDB = db.tags;
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
      tagsDB
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
        [
          2,
          [
            { type: 'del', content: '' },
            { type: 'add', content: '- line 2 #tag1' },
          ],
        ],
      ]),
      filesDB,
      linesDB,
      tagsDB
    );
    expect(fileChanges.length).toBe(0);
  });
  test('add a query and get file update', () => {
    const fileChanges = runtest(
      'file1.md',
      new Map([[5, [{ type: 'add', content: '+tag1' }]]]),
      filesDB,
      linesDB,
      tagsDB
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
      new Map([[3, [{ type: 'add', content: '- line 2.1 #tag1' }]]]),
      filesDB,
      linesDB,
      tagsDB
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
      new Map([[4, [{ type: 'add', content: '  - line 2.1.1' }]]]),

      filesDB,
      linesDB,
      tagsDB
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
      new Map([[5, [{ type: 'add', content: '  - line 2.1.2 #tag2' }]]]),
      filesDB,
      linesDB,
      tagsDB
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
        [1, [{ type: 'add', content: '- line x #tag1 #tag2' }]],
        [
          8,
          [
            { type: 'del', content: '' },
            { type: 'add', content: 'dummy text' },
          ],
        ],
        [
          9,
          [
            { type: 'del', content: '' },
            { type: 'add', content: '+tag1 +tag2' },
          ],
        ],
      ]),
      filesDB,
      linesDB,
      tagsDB
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
  test('deleting query should delete results too', () => {
    const fileChanges = runtest(
      'file1.md',
      new Map([[9, [{ type: 'del', content: '- line x #tag1 #tag2' }]]]),
      filesDB,
      linesDB,
      tagsDB
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
});

function runtest(
  filePath: string,
  changes: Map<number, Change[]>,
  filesDB: Collection<File>,
  linesDB: Collection<Line>,
  tagsDB: Collection<Tags>
) {
  return getFilesToUpdate(changes, filePath, linesDB, filesDB, tagsDB);
}

function newFileChanges(fileText: string) {
  return new Map(
    fileText
      .split(lineSeperator)
      .map((content) => [{ type: 'add', content } as Change])
      .entries()
  );
}

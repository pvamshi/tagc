import { Change } from '../commit-changes/models';
import { Line, Tags, File } from '../db';
import { updateLines, updateTreeStructure } from '../lines';
import Loki from 'lokijs';
import _ from 'lodash';
// describe('lines', () => {
describe('updateLines', () => {
  let lines: Collection<Line>;
  let files: Collection<File>;
  let tags: Collection<Tags>;
  beforeAll(async () => {
    const db = await prepareDB();
    lines = db.lines;
    files = db.files;
    tags = db.tags;
  });
  it('should add lines', async () => {
    const changes = new Map([
      [0, [{ type: 'add', content: 'line 1' } as Change]],
      [1, [{ type: 'add', content: '- line 2' } as Change]],
      [2, [{ type: 'add', content: '  - line 3' } as Change]],
      [3, [{ type: 'add', content: '  - [ ] line 4' } as Change]],
      [4, [{ type: 'add', content: '  - [x] line 5' } as Change]],
    ]);
    const newLines = updateLines(changes, 'file1.md', lines, files, tags);
    expect(newLines.addedLines.length).toBe(5);
    expect(files.count()).toBe(1);
    expect(lines.count()).toBe(5);
    const fileResults = files.find({ filePath: 'file1.md' });
    expect(fileResults.length).toBe(1);
    const lineResults = lines.find({ fileId: fileResults[0].$loki });
    expect(lineResults.length).toBe(5);
    const linesAdded = fileResults[0].children;
    const linesAddedResults = lines.find({ $loki: { $in: linesAdded } });
    expect(linesAddedResults.length).toBe(5);
    expect(linesAddedResults[0].content).toBe('line 1');
    expect(linesAddedResults[0].type).toBe('TEXT');
    expect(linesAddedResults[0].depth).toBe(0);
    expect(linesAddedResults[1].content).toBe('- line 2');
    expect(linesAddedResults[1].type).toBe('LIST');
    expect(linesAddedResults[1].depth).toBe(0);
    expect(linesAddedResults[2].content).toBe('  - line 3');
    expect(linesAddedResults[2].type).toBe('LIST');
    expect(linesAddedResults[2].depth).toBe(2);
    expect(linesAddedResults[3].content).toBe('  - [ ] line 4');
    expect(linesAddedResults[3].type).toBe('TASK');
    expect(linesAddedResults[3].done).toBe(false);
    expect(linesAddedResults[3].depth).toBe(2);
    expect(linesAddedResults[4].content).toBe('  - [x] line 5');
    expect(linesAddedResults[4].type).toBe('TASK');
    expect(linesAddedResults[4].done).toBe(true);
    expect(linesAddedResults[4].depth).toBe(2);
  });

  it('should update lines', async () => {
    const fileResults = files.find({ filePath: 'file1.md' });
    expect(fileResults.length).toBe(1);
    const changes = new Map([
      [5, [{ type: 'add', content: '- line 6' } as Change]],
      [
        1,
        [
          { type: 'add', content: '- line 2a' } as Change,
          { type: 'del', content: '- line 2' } as Change,
        ],
      ],
    ]);
    const { addedLines, deletedLines } = updateLines(
      changes,
      'file1.md',
      lines,
      files,
      tags
    );
    expect(files.count()).toBe(1);
    expect(lines.count()).toBe(7);
    expect(addedLines.length).toBe(2);
    expect(deletedLines.length).toBe(1);
    const linesInFile = fileResults[0].children.map((lineId) =>
      lines.findOne({ $loki: lineId })
    );
    expect(linesInFile.map((line) => line?.content)).toEqual([
      'line 1',
      '- line 2a',
      '  - line 3',
      '  - [ ] line 4',
      '  - [x] line 5',
      '- line 6',
    ]);
  });
  it('should delete lines', async () => {
    const fileResults = files.find({ filePath: 'file1.md' });
    expect(fileResults.length).toBe(1);
    const changes = new Map([
      [1, [{ type: 'del', content: '- line 6' } as Change]],
    ]);
    const { addedLines, deletedLines } = updateLines(
      changes,
      'file1.md',
      lines,
      files,
      tags
    );
    expect(files.count()).toBe(1);
    expect(lines.count()).toBe(7); // not 6 becauese we have one deleted line from previous test
    expect(deletedLines.length).toBe(1);
    expect(addedLines.length).toBe(0);
    const linesInFile = fileResults[0].children.map((lineId) =>
      lines.findOne({ $loki: lineId })
    );
    expect(linesInFile.map((line) => line?.content)).toEqual([
      'line 1',
      '  - line 3',
      '  - [ ] line 4',
      '  - [x] line 5',
      '- line 6',
    ]);
  });

  it('should build the tree structure', () => {
    const fileResults = files.find({ filePath: 'file1.md' });
    expect(fileResults.length).toBe(1);
    const file = fileResults[0];
    const lineBefore = lines.findOne({ $loki: file.children[0] });
    expect(lineBefore?.children.length).toBe(0);
    updateTreeStructure(file.$loki, lines, files, tags);
    const lineAfter = lines.findOne({ $loki: file.children[0] });
    expect(lineAfter?.children.length).toBe(3);
    expect(
      lineAfter?.children
        .map((child) => lines.findOne({ $loki: child }))
        .map((line) => line?.content)
        .join('\n')
    ).toBe(`  - line 3
  - [ ] line 4
  - [x] line 5`);
  });

  it('should build the tree structure : multiple indent level', () => {
    const lineText = `- line 1
- line 2
  - line 2.1
  - line 2.2
    - line 2.2.1
    - line 2.2.2
  - line 2.3
- line 3`;
    const changes = lineText
      .split('\n')
      .map((line) => [{ type: 'add', content: line } as Change])
      .entries();
    const filePath = 'file2.md';
    const { fileId } = updateLines(
      new Map(changes),
      filePath,
      lines,
      files,
      tags
    );
    updateTreeStructure(fileId, lines, files, tags);
    const fileResult = files.findOne({ filePath });
    expect(fileResult).not.toBeNull();
    expect(fileResult?.children.length).toBe(8);
    expect(
      fileResult?.children
        .map((line) => lines.findOne({ $loki: line }))
        .map((line) => line?.children.length)
    ).toEqual([0, 3, 0, 2, 0, 0, 0, 0]);
  });
  it('should build the tree structure : multiple levels closing at once', () => {
    const lineText = `- line 1
- line 2
  - line 2.1
  - line 2.2
    - line 2.2.1
    - line 2.2.2
      - line 2.2.2.1`;

    const changes = lineText
      .split('\n')
      .map((line) => [{ type: 'add', content: line } as Change])
      .entries();
    const filePath = 'file3.md';
    const { fileId } = updateLines(
      new Map(changes),
      filePath,
      lines,
      files,
      tags
    );
    updateTreeStructure(fileId, lines, files, tags);
    const fileResult = files.findOne({ filePath });
    expect(fileResult).not.toBeNull();
    expect(fileResult?.children.length).toBe(7);
    expect(
      fileResult?.children
        .map((line) => lines.findOne({ $loki: line }))
        .map((line) => line?.children.length)
    ).toEqual([0, 2, 0, 2, 0, 1, 0]);
  });
  it('should build the tree structure : multiple rogue indentation ', () => {
    const lineText = `- line 1
- line 2
  - line 2.1
  - line 2.2
    - line 2.2.1
    - line 2.2.2
     - line 2.2.2.1
      - line 2.2.2.2`;

    const changes = lineText
      .split('\n')
      .map((line) => [{ type: 'add', content: line } as Change])
      .entries();
    const filePath = 'file4.md';
    const { fileId } = updateLines(
      new Map(changes),
      filePath,
      lines,
      files,
      tags
    );
    updateTreeStructure(fileId, lines, files, tags);
    const fileResult = files.findOne({ filePath });
    expect(fileResult).not.toBeNull();
    expect(fileResult?.children.length).toBe(8);
    expect(
      fileResult?.children
        .map((line) => lines.findOne({ $loki: line }))
        .map((line) => line?.children.length)
    ).toEqual([0, 2, 0, 2, 0, 1, 1, 0]);
  });
});

export function prepareDB(): Promise<{
  lines: Collection<Line>;
  files: Collection<File>;
  tags: Collection<Tags>;
}> {
  let lines: Collection<Line> | null;
  let files: Collection<File> | null;
  let tags: Collection<Tags> | null;
  return new Promise((resolve, reject): void => {
    try {
      const db = new Loki('test', {
        autoload: true,
        autoloadCallback: () => {
          lines = db.getCollection('lines');
          if (lines === null) {
            lines = db.addCollection('lines', { indices: ['fileId'] });
          }
          files = db.getCollection('files');
          if (files === null) {
            files = db.addCollection('files', { indices: ['filePath'] });
          }
          tags = db.getCollection('tags');
          if (tags === null) {
            tags = db.addCollection('tags', { indices: ['lineId'] });
          }
          if (lines !== null && files !== null) {
            resolve({ lines, files, tags });
          } else {
            reject('something went wrong while loading DB');
          }
        },
        autosave: true,
        autosaveInterval: 4000,
      });
    } catch (err) {
      reject(err);
    }
  });
}

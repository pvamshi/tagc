import { Change } from '../commit-changes/models';
import { Line, Tags, File } from '../db';
import { updateLines } from '../lines';
import Loki from 'lokijs';
import { before } from 'lodash';
// describe('lines', () => {
describe('updateLines', () => {
  let lines: Collection<Line>;
  let files: Collection<File>;
  beforeAll(async () => {
    const db = await prepareDB();
    lines = db.lines;
    files = db.files;
  });
  it('should add lines', async () => {
    const changes = new Map([
      [0, [{ type: 'add', content: 'line 1' } as Change]],
      [1, [{ type: 'add', content: '- line 2' } as Change]],
      [2, [{ type: 'add', content: '  - line 3' } as Change]],
      [3, [{ type: 'add', content: '  - [ ] line 4' } as Change]],
      [4, [{ type: 'add', content: '  - [x] line 5' } as Change]],
    ]);
    updateLines(changes, 'file1.md', lines, files);
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
    updateLines(changes, 'file1.md', lines, files);
    expect(files.count()).toBe(1);
    expect(lines.count()).toBe(6);
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
    updateLines(changes, 'file1.md', lines, files);
    expect(files.count()).toBe(1);
    expect(lines.count()).toBe(5);
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
});
// });

function prepareDB(): Promise<{
  lines: Collection<Line>;
  files: Collection<File>;
}> {
  let lines: Collection<Line> | null;
  let files: Collection<File> | null;
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
          if (lines !== null && files !== null) {
            resolve({ lines, files });
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

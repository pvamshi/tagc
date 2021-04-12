import { getChanges } from '..';
import { lineSeperator } from '../../config.json';
jest.mock('../utils');

const s = (str: TemplateStringsArray) => str[0].split('\n');

describe.only('commit-changes', () => {
  test('empty map when no changes', () => {
    const changes = getChanges(s`text1\ntext2\ntext3`, s`text1\ntext2\ntext3`);
    expect(changes.size).toBe(0);
  });

  test('add at the beginning ', () => {
    const changes = getChanges(
      s`text1\ntext2\ntext3`,
      s`textnew\ntext1\ntext2\ntext3`
    );
    expect(changes.size).toBe(1);
    expect(changes.get(0)).toEqual([{ type: 'add', content: ['textnew'] }]);
  });
  test('delete at the beginning ', () => {
    const changes = getChanges(s`text1\ntext2\ntext3`, s`text2\ntext3`);
    expect(changes.size).toBe(1);
    expect(changes.get(0)).toEqual([{ type: 'del' }]);
  });
  test('update at the beginning ', () => {
    const changes = getChanges(
      s`text1\ntext2\ntext3`,
      s`textnew\ntext2\ntext3`
    );
    expect(changes.size).toBe(1);
    expect(changes.get(0)).toEqual([
      { type: 'del' },
      { type: 'add', content: ['textnew'] },
    ]);
  });
  test('add at the end ', () => {
    const changes = getChanges(
      s`text1\ntext2\ntext3\n`,
      s`text1\ntext2\ntext3\ntextnew\n`
    );
    expect(changes.size).toBe(1);
    expect(changes.get(3)).toEqual([{ type: 'add', content: ['textnew'] }]);
  });
  test('delete at the end ', () => {
    const changes = getChanges(s`text1\ntext2\ntext3\n`, s`text1\ntext2\n`);
    expect(changes.size).toBe(1);
    expect(changes.get(2)).toEqual([{ type: 'del' }]);
  });
  test('update at the end ', () => {
    const changes = getChanges(
      s`text1\ntext2\ntext3\n`,
      s`text1\ntext2\ntextnew\n`
    );
    expect(changes.size).toBe(1);
    expect(changes.get(2)).toEqual([
      { type: 'del' },
      { type: 'add', content: ['textnew'] },
    ]);
  });

  test('add in the middle ', () => {
    const changes = getChanges(
      s`text1\ntext2\ntext3\n`,
      s`text1\ntext2\ntextnew\ntext3\n`
    );
    expect(changes.size).toBe(1);
    expect(changes.get(2)).toEqual([{ type: 'add', content: ['textnew'] }]);
  });
  test('del in the middle ', () => {
    const changes = getChanges(s`text1\ntext2\ntext3\n`, s`text1\ntext3\n`);
    expect(changes.size).toBe(1);
    expect(changes.get(1)).toEqual([{ type: 'del' }]);
  });
  test('update in the middle ', () => {
    const changes = getChanges(
      s`text1\ntext2\ntext3\n`,
      s`text1\ntextnew\ntext3\n`
    );
    expect(changes.size).toBe(1);
    expect(changes.get(1)).toEqual([
      { type: 'del' },
      { type: 'add', content: ['textnew'] },
    ]);
  });
});

// WARNING: These tests are specific to my system

import { getText, writeText } from '../fileio';

xdescribe('file io', () => {
  test('get file data', async () => {
    const data = await getText('test.md');
    expect(data).toBe(`# Test file\n`);
  });
  test('write file data', async () => {
    const text = String(new Date().getTime());
    await writeText('test-write.md', text);
    getText('test-write.md');
  });
});

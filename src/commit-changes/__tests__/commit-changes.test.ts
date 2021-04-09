import { asyncExec } from '../utils';
import { commitFile, getFileChanges } from '..';
jest.mock('../utils');
xdescribe('commit-changes', () => {
  it('should give empty array if there are no changes', async () => {
    (asyncExec as jest.Mock).mockResolvedValue({
      stderr: `
file is unchanged; `,
    });
    const changes = await getFileChanges('random file');
    expect(changes).toEqual(new Map());
  });
  it('should give all lines if its a new file', async () => {
    (asyncExec as jest.Mock)
      .mockResolvedValue({
        stderr: `
initial revision: 1.1; `,
      })
      .mockResolvedValue({
        stdout: `line 1
line 2`,
      });
    const changes = await getFileChanges('random file');
    expect(changes).toEqual(
      new Map([
        [0, { type: 'add', content: 'line 1' }],
        [1, { type: 'add', content: 'line 2' }],
      ])
    );
  });
});

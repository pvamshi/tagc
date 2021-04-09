export type LineDiff = {
  [key: string]: { type: 'del' | 'add'; content: string }[];
};
export interface DiffType {
  filePath: string;
  changes: LineDiff;
}
export type ChangeType = 'del' | 'add';
export type Change = { type: ChangeType; content: string };

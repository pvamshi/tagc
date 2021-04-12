export type LineDiff = {
  [key: string]: { type: 'del' | 'add'; content: string }[];
};
export interface DiffType {
  filePath: string;
  changes: LineDiff;
}
export type ChangeType = 'del' | 'add';
export type ChangeOld =
  | { type: 'add'; content: string }
  | { type: 'del'; content?: string };
export type AddChange = { type: 'add'; content: string[] };
export type DeleteChange = { type: 'del' };
export type Change = AddChange | DeleteChange;

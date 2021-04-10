import { Change } from './commit-changes/models';
import { File, Line, Tags } from './db';
import {
  deleteLines,
  getFileText,
  getQueryResultsLines,
  updateLines,
  updateQueryResults,
  updateTreeStructure,
} from './lines';
import { getQueries, getQueryResults } from './query';
import { addTagsToChanges, tagsInLines } from './tags';
export function getFilesToUpdate(
  changes: Map<number, Change[]>,
  filePath: string,
  lines: Collection<Line>,
  files: Collection<File>,
  tags: Collection<Tags>
) {
  // save changes in db
  const { addedLines, deletedLines, fileId } = updateLines(
    changes,
    filePath,
    lines,
    files,
    tags
  );
  const addedTags = addTagsToChanges(addedLines, lines, tags);
  updateTreeStructure(fileId, lines, files, tags);
  const updatedTags = [
    ...new Set([
      ...addedTags.flatMap((tag) =>
        [tag.hashtag, tag.includeTag, tag.excludeTag, tag.inheritedTags].flat()
      ),
      ...tagsInLines(deletedLines, tags),
    ]),
  ];
  deleteLines(deletedLines, lines, tags);
  const queryTags = getQueries(updatedTags, tags);
  log({ queryTags });
  // write tests for tags ??
  const queryResults = getQueryResults(queryTags, tags);
  const queryResultsLines = getQueryResultsLines(queryResults, lines);
  const filesToUpdate = updateQueryResults(queryResultsLines, lines, files);
  return filesToUpdate.map((fileId) => getFileText(fileId, lines, files));
}

export function log(str: Object) {
  console.log(JSON.stringify(str, null, 2));
}

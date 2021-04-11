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
import { addTagsToChanges, getTagsFromDeleteLines, tagsInLines } from './tags';
export function getFilesToUpdate(
  changes: Map<number, Change[]>,
  filePath: string,
  lines: Collection<Line>,
  files: Collection<File>,
  tags: Collection<Tags>
) {
  try {
    let filesToUpdate = [];
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
          [
            tag.hashtag,
            tag.includeTag,
            tag.excludeTag,
            tag.inheritedTags,
          ].flat()
        ),
        ...getTagsFromDeleteLines(deletedLines, lines, tags),
      ]),
    ];

    deleteLines(deletedLines, lines, tags);
    if (deletedLines.length > 0) {
      // may be query is deleted ?
      filesToUpdate.push(fileId);
    }
    const queryTags = getQueries(updatedTags, tags);
    // write tests for tags ??
    const queryResults = getQueryResults(queryTags, tags);
    const queryResultsLines = getQueryResultsLines(queryResults, lines);
    filesToUpdate = [
      ...new Set(
        filesToUpdate.concat(
          updateQueryResults(queryResultsLines, lines, files)
        )
      ),
    ];
    return filesToUpdate.map((fileId) => getFileText(fileId, lines, files));
  } catch (error) {
    console.error('Error somewhere catching it all');
  }
}

export function log(str: Object) {
  console.log(JSON.stringify(str, null, 2));
}

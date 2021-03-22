import loki from 'lokijs'
import { Block } from './parser'
const db = new loki('tagc.db')

export type FileData = { name: string } & Block
var fileDatas = db.addCollection<FileData>('fileData')

export function saveTags(file: string, blocks: Block[]) {
  const fileDataList: FileData[] = blocks.map((block) => ({
    ...block,
    name: file,
  }))
  fileDatas.insert(fileDataList)
}

export function getHashTagBlocks(tag: string) {
  const files: FileData[] = fileDatas.where(
    (file) => file.tags.hashtag.length > 0 && file.tags.hashtag.includes(tag)
  )
  return files.reduce((acc: { [file: string]: FileData[] }, curr: FileData) => {
    acc[curr.name] = [...(acc[curr.name] || []), curr]
    return acc
  }, {})
}
export interface TargetTemp {
  lineNumber: number
  tags: string[]
  update: boolean
}
export function getIncludeTags(): { [file: string]: TargetTemp[] } {
  const includeTags = fileDatas.where((file) => file.tags.includeTag.length > 0)
  return includeTags.reduce(
    (acc: { [file: string]: TargetTemp[] }, curr: FileData) => {
      acc[curr.name] = [
        ...(acc[curr.name] || []),
        {
          lineNumber: curr.startIndex,
          tags: curr.tags.includeTag,
          update: false,
        },
      ]
      return acc
    },
    {}
  )
}

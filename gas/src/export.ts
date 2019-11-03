function getSpreadSheetAndFolder(): [
  GoogleAppsScript.Spreadsheet.Spreadsheet,
  GoogleAppsScript.Drive.Folder
] {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)

  let folders = DriveApp.getFoldersByName('Twi-Bookmark')
  let folder: GoogleAppsScript.Drive.Folder | null = null
  while (folders.hasNext()) {
    folder = folders.next()
  }
  let root: GoogleAppsScript.Drive.Folder
  if (folder === null) {
    root = DriveApp.createFolder('Twi-Bookmark')
  } else {
    root = folder
  }

  folders = root.getFoldersByName(`${date.getFullYear()}`)
  folder = null
  while (folders.hasNext()) {
    folder = folders.next()
  }
  let yearFolder: GoogleAppsScript.Drive.Folder
  if (folder === null) {
    yearFolder = root.createFolder(`${date.getFullYear()}`)
  } else {
    yearFolder = folder
  }

  folders = yearFolder.getFoldersByName(`${date.getMonth() + 1}`)
  folder = null
  while (folders.hasNext()) {
    folder = folders.next()
  }
  let monthFolder: GoogleAppsScript.Drive.Folder
  if (folder === null) {
    monthFolder = yearFolder.createFolder(`${date.getMonth() + 1}`)
  } else {
    monthFolder = folder
  }

  const filename = `${date.getFullYear()}-${date.getMonth() + 1}`
  const files = monthFolder.getFilesByName(filename)
  let file: GoogleAppsScript.Drive.File | null = null
  while (files.hasNext()) {
    file = files.next()
  }
  if (file === null) {
    const ssId = SpreadsheetApp.create(filename).getId()
    const f = DriveApp.getFileById(ssId)
    monthFolder.addFile(f)
    DriveApp.getRootFolder().removeFile(f)
    return [SpreadsheetApp.openById(ssId), monthFolder]
  } else {
    return [SpreadsheetApp.openById(file.getId()), monthFolder]
  }
}

function main() {
  const [ss, folder] = getSpreadSheetAndFolder()
  const sheets = ss.getSheets()
  const twitter = /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/
  for (const sheet of sheets) {
    let content = `---
title: ${sheet.getName()}
tags:
- メモ
- ${sheet.getName()}
---

`

    const data = sheet.getDataRange().getValues()
    for (const [title, url, comment, oembed] of data) {
      if (twitter.test(url)) {
        content += `
${oembed}`
      } else {
        content += `
[${title}](${url})
`
      }
      if (comment !== undefined) {
        content += `
${comment}
`
      }
    }

    const blob = Utilities.newBlob(
      '',
      'text/plain',
      sheet.getName()
    ).setDataFromString(content, 'utf-8')
    folder.createFile(blob)
  }
}

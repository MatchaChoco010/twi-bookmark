class PostEvent {
  queryString: string
  parameter: { [index: string]: string }
  parameters: { [index: string]: [string] }
  contentLenth: number
  postData: {
    length: number
    type: string
    contents: string
    name: string
  }
}

function getSpreadSheet() {
  const date = new Date()

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
    return SpreadsheetApp.openById(ssId)
  } else {
    return SpreadsheetApp.openById(file.getId())
  }
}

function getSheet(
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
  sheetName: string
) {
  let sheet = ss.getSheetByName(sheetName)
  if (sheet == null) {
    sheet = ss.insertSheet(sheetName)
  }
  return sheet
}

function doPost(e: PostEvent): GoogleAppsScript.Content.TextOutput {
  const postData = JSON.parse(e.postData.contents)

  const ss = getSpreadSheet()
  const sheet = getSheet(ss, postData.category)

  try {
    const twitter = /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/
    if (twitter.test(postData.url)) {
      const response = UrlFetchApp.fetch(
        `https://publish.twitter.com/oembed?url=${encodeURIComponent(
          postData.url
        )}`
      )
      const content = JSON.parse(response.getContentText('UTF-8'))
      sheet.appendRow([
        postData.title,
        postData.url,
        postData.comment,
        content.html
      ])
    } else {
      sheet.appendRow([postData.title, postData.url, postData.comment])
    }
  } catch (e) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'failure',
        message: e.message
      })
    )
  }

  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'success',
      message: ''
    })
  )
}

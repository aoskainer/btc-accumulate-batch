class CustomLogger {
  folder: GoogleAppsScript.Drive.Folder;
  logFileName: string;
  logs: string[];

  constructor(appName: string) {
    const logFolderId = PropertiesService.getScriptProperties().getProperty("LOG_FOLDER_ID")!;
    this.folder = DriveApp.getFolderById(logFolderId);
    this.logFileName = `${appName}.${new Date().toISOString()}.log`;
    this.logs = [];
  }

  debug(message: string) {
    this.logs.push(`${new Date().toISOString()} [DEBUG] ${message}`);
  }

  info(message: string) {
    this.logs.push(`${new Date().toISOString()} [INFO] ${message}`);
  }

  warn(message: string) {
    this.logs.push(`${new Date().toISOString()} [WARN] ${message}`);
  }

  error(message: string) {
    this.logs.push(`${new Date().toISOString()} [ERROR] ${message}`);
  }

  finalize() {
    this.folder.createFile(this.logFileName, this.logs.join("\n"));
  }
}

export default CustomLogger;

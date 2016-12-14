// Source:
// https://github.com/trollkarlen2/gmail-rule-processor (forked from https://github.com/ahochsteger/gmail2gdrive)

/**
 * Returns the label with the given name or creates it if not existing.
 */
function getOrCreateLabel(labelName) {
  var label = GmailApp.getUserLabelByName(labelName);
  if (label == null) {
    label = GmailApp.createLabel(labelName);
  }
  return label;
}

/**
 * Recursive function to create and return a complete folder path.
 */
function getOrCreateSubFolder(baseFolder,folderArray) {
  if (folderArray.length == 0) {
    return baseFolder;
  }
  var nextFolderName = folderArray.shift();
  var nextFolder = null;
  var folders = baseFolder.getFolders();
  while (folders.hasNext()) {
    folder = folders.next();
    folderName = folder.getName();
    if (folderName == nextFolderName){
      nextFolder = folder;
      break;
    }
  }
  if (nextFolder == null) {
    // Folder does not exist - create it.
    nextFolder = baseFolder.createFolder(nextFolderName);
  }
  return getOrCreateSubFolder(nextFolder,folderArray);
}

/**
 * Returns the GDrive folder with the given path.
 */
function getFolderByPath(path) {
  var parts = path.split("/");

  if (parts[0] == '') parts.shift(); // Did path start at root, '/'?

  var folder = DriveApp.getRootFolder();
  for (var i = 0; i < parts.length; i++) {
    var result = folder.getFoldersByName(parts[i]);
    if (result.hasNext()) {
      folder = result.next();
    } else {
      throw new Error( "folder not found." );
    }
  }
  return folder;
}

/**
 * Returns the GDrive folder with the given name or creates it if not existing.
 */
function getOrCreateFolder(folderName) {
  var folder;
  try {
    folder = getFolderByPath(folderName);
  } catch(e) {
    var folderArray = folderName.split("/");
    folder = getOrCreateSubFolder(DriveApp.getRootFolder(), folderArray);
  }
  return folder;
}

function getSanitizedFilename(name) {
  return name.replace(/[^a-zA-Z0-9 .@]/g, "");
}

/**
 * Main function that processes Gmail attachments and stores them in Google Drive.
 * Use this as trigger function for periodic execution.
 */
function GmailRuleProcessor() {
  if (!GmailApp) return; // Skip script execution if GMail is currently not available (yes this happens from time to time and triggers spam emails!)
  var config = getGmailRuleProcessorConfig();
  var label = getOrCreateLabel(config.processedLabel);
  var end, start;
  start = new Date();

  Logger.log("INFO: Starting mail attachment processing.");
  for (var ruleIdx=0; ruleIdx<config.rules.length; ruleIdx++) {
    var rule = config.rules[ruleIdx];
    var gSearchExp  = rule.filter + " has:attachment -label:" + config.processedLabel;
    if (config.newerThan != "") {
      gSearchExp += " newer_than:" + config.newerThan;
    }
    var doArchive = rule.archive == true;
    var threads = GmailApp.search(gSearchExp);

    Logger.log("INFO:   Processing rule: "+gSearchExp);
    for (var threadIdx=0; threadIdx<threads.length; threadIdx++) {
      var thread = threads[threadIdx];
      end = new Date();
      var runTime = (end.getTime() - start.getTime())/1000;
      Logger.log("INFO:     Processing thread: "+thread.getFirstMessageSubject() + " (runtime: " + runTime + "s/" + config.maxRuntime + "s)");
      if (runTime >= config.maxRuntime) {
        Logger.log("WARNING: Self terminating script after " + runTime + "s")
        return;
      }
      var messages = thread.getMessages();
      for (var msgIdx=0; msgIdx<messages.length; msgIdx++) {
        var message = messages[msgIdx];
        var sanitizedFrom = message.getFrom();
        Logger.log("INFO:       Processing message: "+message.getSubject() + " (" + message.getId() + ") from " + message.getFrom());
        var messageDate = message.getDate();
        var attachments = message.getAttachments();
        for (var attIdx=0; attIdx<attachments.length; attIdx++) {
          var attachment = attachments[attIdx];
          Logger.log("INFO:         Processing attachment: "+attachment.getName());
          try {
            var folder = getOrCreateFolder(rule.folder);

            var driveFilename = attachment.getName();
            if (
              (rule.filenameTo && rule.filenameFrom && rule.filenameFrom == attachment.getName())
            ||
              (rule.filenameTo)
            ){
              driveFilename = Utilities.formatDate(messageDate, config.timezone, rule.filenameTo
                                                   .replace('%s',getSanitizedFilename(message.getSubject()))
                                                   .replace('%f',getSanitizedFilename(message.getFrom()))
                                                   .replace('%n',attachment.getName()));
            }
            
            if (!folder.getFilesByName(driveFilename).hasNext()) {
              var file = folder.createFile(attachment);
              file.setName(driveFilename);
              file.setDescription("Mail title: " + message.getSubject() + "\nMail date: " + message.getDate() + "\nMail link: https://mail.google.com/mail/u/0/#inbox/" + message.getId());
              Logger.log("INFO:           Attachment '" + attachment.getName() + "' saved as '" + driveFilename + "'");
            } else {
              // File already exists (based on its name)
              Logger.log("WARN:           Cannot save '" + attachment.getName() + "' as '" + driveFilename + "' since it already exists.");
            }

            Utilities.sleep(config.sleepTime);
          } catch (e) {
            Logger.log(e);
          }
        }
        
        if (rule.forwardTo) {
          try {
            // See https://developers.google.com/apps-script/reference/gmail/gmail-message#forward(String)
            message.forward(rule.forwardTo/*, { cc: "", bcc: "" }*/);
            Logger.log("INFO:           Message was forwarded to '" + rule.forwardTo + "'.");
          } catch (e) {
            Logger.log(e);
          }
        }
      }
      thread.addLabel(label);
      if (doArchive) {
        Logger.log("INFO:     Archiving thread '" + thread.getFirstMessageSubject() + "' ...");
        thread.moveToArchive();
      }
    }
  }
  end = new Date();
  var runTime = (end.getTime() - start.getTime())/1000;
  Logger.log("INFO: Finished mail attachment processing after " + runTime + "s");
}

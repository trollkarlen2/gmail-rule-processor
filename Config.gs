/**
 * Configuration for GmailRuleProcessor
 */
function getGmailRuleProcessorConfig() {
  return {
    // Gmail label for processed threads (will be created, if not existing):
    "processedLabel": "to-gdrive/processed",

    // Sleep time in milli seconds between processed messages:
    "sleepTime": 100,

    // Maximum script runtime in seconds (google scripts will be killed after 5 minutes):
    "maxRuntime": 280,

    // Only process message newer than (leave empty for no restriction; use d, m and y for day, month and year):
    "newerThan": "1m",

    // Timezone for date/time operations:
    "timezone": "GMT",

    // Processing rules:
    "rules": [
      // Rule parameter documentation:
      //  * filter (String, mandatory): a typical gmail search expression (see http://support.google.com/mail/bin/answer.py?hl=en&answer=7190)
      //  * folder (String, mandatory): a path to an existing Google Drive folder (will be created, if not existing)
      //  * archive (boolean, optional): Should the gmail thread be archived after processing? (default: false)
      //  * filenameFrom (String, optional): The attachment filename that should be renamed when stored in Google Drive
      //  * filenameTo (String, optional): The pattern for the new filename of the attachment. If 'filenameFrom' is not given then this will be the new filename for all attachments.
      //  * You can use '%s' to insert the email subject and date format patterns like 'yyyy' for year, 'MM' for month and 'dd' for day as pattern in the filename.
      //    See https://developers.google.com/apps-script/reference/utilities/utilities#formatDate(Date,String,String) for more information on the possible date format strings.

      { // Mails sent to your_email@example.com which have attachments will be forwarded to your_other_address@example.com.
        // The attachments themselves will be renamed and saved in the Attachments folder on your Google Drive.
        "filter": "to:your_email@example.com",
        "folder": "Attachments",
        "filenameTo": "yyyy-MM-dd-'%n'",
        "forwardTo": "your_other_address@example.com"
      },
      { // Replace all files with the variable 'filenameTo' string.
        "filter": "(from:example3a@example.com OR from:example3b@example.com)",
        "folder": "Examples/example3ab",
        "filenameTo": "'file-'yyyy-MM-dd-'%s.txt'",
        "archive": true
      },
      { // Replace all files that match the 'filenameFrom' string with the variable 'filenameTo' string
        "filter": "(from:example3a@example.com OR from:example3b@example.com)",
        "folder": "Examples/example3ab",
        "filenameFrom": "file.txt",
        "filenameTo": "'file-'yyyy-MM-dd-'%s.txt'",
        "archive": true
      }
    ]
  };
}

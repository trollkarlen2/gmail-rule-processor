GmailRuleProcessor
==================

GmailRuleProcessor is a Google Apps Script which looks for mails with attachments and then (1) puts them on Google Drive folders and (2) forwards them to another e-mail address.

The idea is that the script is then scheduled to run once every, say, hour using the built-in scheduler in the Google Scripts editor.


Features
--------

* Processes mails with attachments according to a set of rules
* Matching mails will be saved to Google Drive.
* Matching mails can be forwarded to another mail account.
* Rename attachments (using date format strings and email subject as filenames)

Setup
-----

1. Open [Google Apps Script](https://script.google.com/).
2. Create an empty project. May may need to click the "Start Scripting" button.
3. Give the project a name (e.g. GmailRuleProcessor)
4. Replace the content of the created file Code.gs with the provided [Code.gs](https://github.com/trollkarlen2/gmail-rule-processor/blob/master/Code.gs) and save the changes.
5. Create a new script file with the name 'Config' and replace its content with the provided [Config.gs](https://github.com/trollkarlen2/gmail-rule-processor/blob/master/Config.gs) and save the changes.
6. Adjust the configuration to your needs. It is recommended to restrict the timeframe using 'newerThan' to prevent running into API quotas by Google.
7. Test the script by manually executing the function GmailRuleProcessor. This is important since the script needs to be 
   granted permissions to access your Google data and you will be prompted to authorize this the first time you run the 
   script manually. You can review the execution logs, if things did not work as expected, by clicking View > Logs. 
8. Create a time based trigger which periodically executes 'GmailRuleProcessor' (e.g. once per day).


Feedback and contributions
--------------------------

Direct any feedback and contributions directly to [Github](https://github.com/trollkarlen2/gmail-rule-processor).


Thanks
------

We'd like to thank [Andreas Hochsteger](https://github.com/ahochsteger) for writing the original script. He in turn thanks [Amit Agarwal](http://www.labnol.org/about/) who provided similar functionality in his article [Send your Gmail Attachments to Google Drive](http://www.labnol.org/internet/send-gmail-to-google-drive/21236/).

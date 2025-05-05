const {sesClient} = require("../config/sesClient");
const { CreateTemplateCommand, UpdateTemplateCommand } = require("@aws-sdk/client-ses");
const fs = require("fs");
const path = require("path");

const TEMPLATE_NAME = "DailyRequestNotification";
const SUBJECT = "You have new friend request!";
const HTML_FILE_PATH = path.join(__dirname, "../templates/requestNotificationTemplate.html");

async function createOrUpdateTemplate() {
    const htmlBody = fs.readFileSync(HTML_FILE_PATH, "utf8");
  
    const params = {
      Template: {
        TemplateName: TEMPLATE_NAME,
        SubjectPart: SUBJECT,
        HtmlPart: htmlBody,
        TextPart: "You have {{requestCount}} new friend request(s)!",
      },
    };
  
    try {
      await sesClient.send(new UpdateTemplateCommand(params));
      console.log(`Template "${TEMPLATE_NAME}" updated successfully.`);
    } catch (err) {
      if (err.Error.Code === "TemplateDoesNotExist") {
        await sesClient.send(new CreateTemplateCommand(params));
        console.log(`Template "${TEMPLATE_NAME}" created successfully.`);
      } else {
        console.error("Error managing template:", err);
      }
    }
}
  
module.exports = {
    createOrUpdateTemplate
}
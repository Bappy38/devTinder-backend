const { sesClient } = require("../config/sesClient")
const { SendTemplatedEmailCommand } = require("@aws-sdk/client-ses");

async function sendEmail(toEmail, templateName, data) {
    const params = {
        Source: process.env.NOREPLY_EMAIL_SENDER,
        Destination: {
            ToAddresses: [toEmail],
        },
        Template: templateName,
        TemplateData: JSON.stringify(data)
    };

    try {
        await sesClient.send(new SendTemplatedEmailCommand(params));
        console.log("Email sent with params: ", params);
    } catch (error){
        console.error("Error occurred while sending email: ", error);
    }
}

module.exports = {sendEmail};
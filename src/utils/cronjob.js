const cron = require("node-cron");
const ConnectionRequest = require("../models/connectionRequest");
const { addDays, startOfDay } = require("date-fns");
const { sendEmail } = require("./sendEmail");

// This job will be run at the end of every day
cron.schedule(process.env.DAILY_REQUEST_NOTIFICATION_SCHEDULE, async () => {
    try {
        const today = addDays(new Date(), 0);
        const todayStart = startOfDay(today);

        //TODO:: Use message queue to do this task at scale. Also do pagination while fetching requests
        const newConnectionRequests = await ConnectionRequest.find({
            status: "interested",
            createdAt:
            {
                $gte: todayStart
            }
        }).populate("toUserId");

        const users = new Set(newConnectionRequests.map(request => request.toUserId));

        for (const user of users) {

            await sendEmail(process.env.SANDBOX_EMAIL_RECEIVER, "DailyRequestNotification", {
                userName: user.firstName,
                requestCount: 1,
                ifMultiple: false
            });
        }
    } catch (err) {
        console.error(err);
    }
});
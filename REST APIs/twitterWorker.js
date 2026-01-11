// Worker starten mit Zertifikat: CAMUNDA_USER=x CAMUNDA_PASS=y node --use-system-ca twitterWorker.js

const { Client, logger, Variables, BasicAuthInterceptor } = require("camunda-external-task-client-js");
const { TwitterApi } = require("twitter-api-v2");

// 1️⃣ Twitter Client konfigurieren
// Diese Tokens holst du aus deinem Twitter Developer Account
const twitterClient = new TwitterApi({
    appKey: '1Nhv4LyRqPJ5STav6AYiYjpqu',
    appSecret: 'JDwBpwq5ypxZgbs0SUx4rUvFR6sph8b2tjIzNvuFoBhQPU8p5O',
    accessToken: '2008923867134447616-ewdtPEXeVEIukwDrB5SqZiHFBYDtJ6',
    accessSecret: 'SUiklLAnxRh4nFX0lRPM6esKvoWD2hvurueQU5RcWQPTv'
});

// Zugriff für Schreiben
const rwClient = twitterClient.readWrite;

// 2️⃣ Camunda Client konfigurieren
const basicAuthentication = new BasicAuthInterceptor({
    username: process.env.CAMUNDA_USER,
    password: process.env.CAMUNDA_PASS
});

const client = new Client({
    baseUrl: "https://camunda25.f4.htw-berlin.de/engine-rest",
    use: logger,
    interceptors: basicAuthentication
});

// 3️⃣ External Task Worker abonnieren
client.subscribe("postTweet", async ({ task, taskService }) => {
    try {
        // Prozessvariablen aus Camunda
        const orderId = task.variables.get("AuftragsID");
        const customer = task.variables.get("Kundennummer");

        // Text des Tweets
        const tweetText = `Dies ist ein interner Nachricht der RoboCare GmbH: Auftrag #${orderId} bei Kunde ${customer} erfolgreich abgeschlossen! (${new Date().toISOString()})`;

        // 4️⃣ Tweet senden
        const { data } = await rwClient.v2.tweet(tweetText);

        console.log("Tweet gesendet:", data);

        // 5️⃣ Tweet-ID zurück in Camunda speichern
        const processVars = new Variables();
        processVars.set("tweetId", data.id);

        await taskService.complete(task, processVars);

    } catch (err) {
        console.error("Fehler beim Twittern:", err);
        await taskService.handleFailure(task, {
            errorMessage: err.message,
            errorDetails: err.stack,
            retries: 1,
            retryTimeout: 1000
        });
    }
});
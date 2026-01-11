// Worker starten mit Credentials und Zertifikat:  CAMUNDA_USER=x CAMUNDA_PASS=y node --use-system-ca index.js

const {
    Client,
    logger,
    Variables,
    BasicAuthInterceptor
} = require("camunda-external-task-client-js");

const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

const basicAuthentication = new BasicAuthInterceptor({
    username: process.env.CAMUNDA_USER,
    password: process.env.CAMUNDA_PASS
});

const client = new Client({
    baseUrl: "https://camunda25.f4.htw-berlin.de/engine-rest",
    use: logger,
    interval: 10000,
    interceptors: basicAuthentication
});

// Worker abonnieren
client.subscribe("calculateDistance", async function({ task, taskService }) {
    try {
        // Adressen aus Prozessvariablen
        const techAddress = task.variables.get("Startpunkt");   // Startadresse Techniker
        const custAddress = task.variables.get("Standort");     // Zieladresse Kunde

        // 1️⃣ Nominatim - Technikerkoordinaten
        const geoTechResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(techAddress)}`);
        const geoTechData = await geoTechResp.json();
        if (!geoTechData[0]) throw new Error("Technikeradresse konnte nicht gefunden werden.");
        const techLat = parseFloat(geoTechData[0].lat);
        const techLon = parseFloat(geoTechData[0].lon);

        // 2️⃣ Nominatim - Kundenkoordinaten
        const geoCustResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(custAddress)}`);
        const geoCustData = await geoCustResp.json();
        if (!geoCustData[0]) throw new Error("Kundenadresse konnte nicht gefunden werden.");
        const custLat = parseFloat(geoCustData[0].lat);
        const custLon = parseFloat(geoCustData[0].lon);

        // 3️⃣ OSRM Routing - Distanz und Fahrzeit
        const routeResp = await fetch(`http://router.project-osrm.org/route/v1/driving/${techLon},${techLat};${custLon},${custLat}?overview=false`);
        const routeData = await routeResp.json();
        if (!routeData.routes || routeData.routes.length === 0) throw new Error("Route konnte nicht berechnet werden.");

        const distanceKm = routeData.routes[0].distance / 1000;
        const travelTimeMinutes = routeData.routes[0].duration / 60;

        // 4️⃣ Ergebnisse in Prozessvariablen zurückschreiben
        const processVars = new Variables();
        processVars.set("distanceKm", Math.round(distanceKm));      // Long
        processVars.set("travelTimeMinutes", Math.round(travelTimeMinutes)); // Long
        processVars.set("customerLat", custLat);
        processVars.set("customerLon", custLon);
        processVars.set("technicianLat", techLat);
        processVars.set("technicianLon", techLon);

        await taskService.complete(task, processVars);
        console.log(`Task completed: ${distanceKm.toFixed(2)} km, ${travelTimeMinutes.toFixed(1)} min`);

    } catch (err) {
        console.error("Error in worker:", err.message);
        await taskService.handleFailure(task, {
            errorMessage: err.message,
            errorDetails: err.stack,
            retries: 1,
            retryTimeout: 1000
        });
    }
});
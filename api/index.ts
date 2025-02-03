import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import {WebSocket} from "ws";

const app = express();
expressWs(app);

const port = 8000;
app.use(cors());

const router = express.Router();
const connectedClients = new Set<WebSocket>();
let pixels: { x: number; y: number; color: string }[] = [];

router.ws('/app', (ws, req) => {
    connectedClients.add(ws);
    console.log('Client connected');

    ws.send(JSON.stringify({ type: "init", pixels }));

    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());

        if (data.type === "draw") {
            pixels.push(...data.pixels);

            connectedClients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: "draw", pixels: data.pixels }));
                } else {
                    connectedClients.delete(client);
                }
            });
        }
    });

    ws.on('close', () => {
        connectedClients.delete(ws);
        console.log('Client disconnected');
    });
});


app.use(router);
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);

});



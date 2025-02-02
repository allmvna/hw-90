import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import {WebSocket} from "ws";

const app = express();
expressWs(app);

const port = 8000;
app.use(cors());

const router = express.Router();

const connectedClients: WebSocket[] = [];

router.ws('/app', (ws, req) => {
    connectedClients.push(ws);
    console.log('Client connected');

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.use(router);
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);

});



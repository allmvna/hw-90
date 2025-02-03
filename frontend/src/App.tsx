import React, { useEffect, useRef, useState } from "react";
import {Card, Paper, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2";

interface Type {
    x: number;
    y: number;
    color: string;
}

const App: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socket = useRef<WebSocket | null>(null);
    const [color, setColor] = useState<string>("#ff0000");

    useEffect(() => {
        socket.current = new WebSocket("ws://localhost:8000/app");

        socket.current.onmessage = ({ data }) => {
            const { pixels }: { pixels: Type[] } = JSON.parse(data);
            drawOnCanvas(pixels);
        };

        socket.current.onerror = (error) => {
            console.error("Error WebSocket: ", error);
        };

        socket.current.onclose = () => {
            console.log("WebSocket connect closed");
        };

        return () => {
            socket.current?.close();
        };
    }, []);


    const drawOnCanvas = (pixels: Type[]) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        pixels.forEach(({ x, y, color }) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
        });
    };


    const handleMouseMove = (e: React.MouseEvent) => {
        if (e.buttons !== 1 || !canvasRef.current || !socket.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const newPixel = {
            x: Math.max(0, Math.min(e.clientX - rect.left, canvasRef.current.width)),
            y: Math.max(0, Math.min(e.clientY - rect.top, canvasRef.current.height)),
            color
        };

        drawOnCanvas([newPixel]);

        if (socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({ type: "draw", pixels: [newPixel] }));
        }
    };

    return (
        <Grid
            container
            spacing={3}
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
        >
            <Grid>
                <Card
                    sx={{
                        mt: 2,
                        p: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        boxShadow: 3,
                        borderRadius: 3
                }}
                >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>🎨 Выберите цвет:</Typography>
                    <TextField
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            cursor: "pointer",
                            "&:hover": {
                                transform: "scale(1.1)"
                            }
                    }}
                    />
                </Card>
            </Grid>
            <Grid>
                <Paper
                    elevation={5}
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        background: "#f5f5f5"
                }}
                >
                    <canvas
                        ref={canvasRef}
                        width={1200}
                        height={600}
                        onMouseMove={handleMouseMove}
                        style={{
                            border: "3px solid #444",
                            borderRadius: 12,
                            cursor: "crosshair",
                            backgroundColor: "#fff"
                    }}
                    />
                </Paper>
            </Grid>
        </Grid>
    );
};

export default App;

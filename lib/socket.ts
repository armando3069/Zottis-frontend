"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        socket = io(
            process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000",
            {
                transports: ["websocket"],
                withCredentials: true,
            }
        );

        socket.on("connect", () => {
            console.log("[socket] connected", socket?.id);
        });

        socket.on("disconnect", (reason) => {
            console.log("[socket] disconnected", reason);
        });
    }

    return socket;
}
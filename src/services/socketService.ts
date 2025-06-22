// services/socketService.ts
import io from "socket.io-client";

const baseUri = import.meta.env.VITE_BASE_URL;

import type { Socket } from "socket.io-client";

const sockets: { [userId: string]: Socket } = {};

export const getSocket = (userId?: string) => {
  if (!userId) {
    console.error("No userId provided for socket connection");
    return io(baseUri, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  if (!sockets[userId]) {
    sockets[userId] = io(baseUri, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    console.log(`Created new socket for user ${userId}`);
  }
  return sockets[userId];
};

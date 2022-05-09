import socketio from "socket.io-client";
import { createContext } from "react";

//export const socket = socketio.connect("88.201.245.12:2000");
export const socket = socketio.connect("88.201.245.12:2000");
export const SocketContext = createContext();
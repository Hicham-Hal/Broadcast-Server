# Broadcast Server

A simple CLI-based WebSocket broadcast server built with Node.js and the [`ws`](https://www.npmjs.com/package/ws) library. Clients can connect to the server, send messages, and have them broadcast in real time to every other connected client — like a minimal chat backend.

Project reference: [roadmap.sh - Broadcast Server](https://roadmap.sh/projects/broadcast-server)

## Features

- Single CLI entry point that can run as either a **server** or a **client**
- Broadcasts incoming messages to all connected clients
- Handles multiple clients connecting and disconnecting concurrently
- Graceful error handling (bad sends, dropped connections, port conflicts)
- Graceful shutdown on `Ctrl+C` for both server and client

## Requirements

- Node.js (v14+ recommended, must support ES modules)
- [`ws`](https://www.npmjs.com/package/ws) package

## Installation

```bash
npm install ws
```

## Usage

### Start the server

```bash
node index.js start
```

This starts a WebSocket server listening on port `8080`.

### Connect as a client

In a separate terminal (you can open as many as you like):

```bash
node index.js connect
```

Once connected, type a message and press `Enter` to send it. Every connected client will receive it.

### Example

**Terminal 1:**
```
node index.js start
```

**Terminal 2:**
```
node index.js connect
Connected to server
hello everyone
```

**Terminal 3:**
```
node index.js connect
Connected to server
hello everyone
```

Both clients receive the broadcast message.

## How it works

### Server (`start`)

1. Opens a `WebSocketServer` on port `8080`.
2. Maintains a `Set` of all currently connected client sockets.
3. On every incoming `message` event, loops through all connected clients and sends the message to each one that is currently `OPEN`.
4. On `close` or `error`, removes the disconnected client from the set.
5. On `SIGINT` (`Ctrl+C`), notifies all connected clients and closes the server cleanly.

### Client (`connect`)

1. Connects to `ws://localhost:8080`.
2. Reads input from the terminal line by line using Node's built-in `readline` module.
3. Sends each typed line to the server once the connection is `open`.
4. Prints any message received from the server (including broadcasts from other clients).
5. On `SIGINT` (`Ctrl+C`), closes the connection and exits cleanly.

## Error handling

- Invalid CLI arguments print an error and exit with a non-zero status code.
- Failed sends to individual clients are caught and that client is removed from the active set.
- Socket-level and server-level `error` events are handled to avoid uncaught exceptions crashing the process.
- Client-side connection errors (e.g. server not running) are caught and logged instead of crashing.

## Possible extensions

- Configurable port via CLI argument (e.g. `node index.js start 9000`)
- Usernames or client labels prefixed to broadcast messages
- Message history for newly connected clients
- Authentication

## License

MIT
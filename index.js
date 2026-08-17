import { argv } from 'process'
import readline from 'readline'
import {WebSocket, WebSocketServer} from 'ws'

const errorHandling = (message) => {
    console.error(`Error: ${message}`)
    process.exit(1)
}

const start = argv[2] === 'start' ? true : false
const connected = argv[2] === 'connect' ? true : false
if(!start && !connected) {
    errorHandling('The second argument must be \'start\' or \'connect\'')
}




if(start){    
    const wss = new WebSocketServer({ port: 8080 })
    const clients = new Set()
    
    wss.on('connection', (socket) => {
        clients.add(socket)

        socket.on('message', (data) => {
            for(const client of clients){
                if(client !== socket && client.readyState === WebSocket.OPEN){
                    try{
                        client.send(data.toString())
                    }catch(err){
                        console.error('Failed to send to a client : ', err.message )
                        clients.delete(client)
                    }
                }
            }
        })
        socket.on('close', () => {
            clients.delete(socket)
        })
        socket.on('error', (err) => {
            console.error('Client socket error: ', err.message)
            clients.delete(socket)
        })
    })
    wss.on('error', (err) => {
        console.error('Server error', err.message)
    })

    process.on('SIGINT', () => {
        console.log('\nShutting down server...')

        for (const client of clients){
            client.close(1000, 'Server is shutting down')
        }

        wss.close(() => {
            console.log('Server closed.')
            process.exit(0)
        })
    })
}

if(connected){
    const socket = new WebSocket('ws://localhost:8080')
    socket.on('error', (err) => {
        console.error('Connection error: ', err.message)
    })
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    
    socket.on('open', () => {
        console.log('Connected to server')
        rl.on('line', (line) => socket.send(line))
    })
    
    socket.on('message', (data) => {
        console.log(data.toString())
    })

    socket.on('close', () => {
        console.log('Disconnected from server.')
        process.exit(0)
    })

    process.on('SIGINT', () => {
        console.log('\nClosing connection...')
        socket.close();
        rl.close();
        process.exit(0)
    })
}

// 1. SETUP THE WEBSOCKET SERVER
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from "uuid"; // Generate unique IDs


const PORT = 8080;
const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`✅ WebSocket Server running on ws://localhost:${PORT}`);
});

// 2. CREATE A DATA STRUCTURE TO STORE USERS
interface ConnectedUser {
    id: string;
    socket: WebSocket;
    username: string;
    roomId: string
}


// 3. Storing Users and Rooms Efficiently
let allSockets: Map<string, ConnectedUser> = new Map()
let rooms: Map<string, ConnectedUser[]> = new Map();


/* {
    "room1": [{socket: socket1, username: "Alice", roomId: "room1"}, 
              {socket: socket2, username: "Bob", roomId: "room1"}],
              
    "room2": [{socket: socket3, username: "Charlie", roomId: "room2"}]
}
 */

// 4. HANDLING NEW CONNECTIONS
wss.on("connection", (socket) => {
    console.log("A user is connected");


    // 5. HANDLING INCOMING MESSAGES
    socket.on("message", (message) => {
        try {
            let data = JSON.parse(message.toString());

            if (data.type === "create-room") {
                let roomId = generateRoomId();
                rooms.set(roomId, [])// create an empty room with this id

                console.log(`[ROOM CREATED] New Room ID: ${roomId}`);

                // send the generated roomID to the creator
                socket.send(JSON.stringify({
                    type: "room-created",
                    roomId,
                }))
            }


            // 6. HANDLE USER JOINING A ROOM
            else if (data.type === "join") {
                let { roomId, username } = data;
                if (!rooms.has(roomId)) {
                    socket.send(JSON.stringify({ type: "error", message: "Room does not exist!" }))
                }

                let userId = uuidv4(); // Generate unique user ID
                let newUser: ConnectedUser = { id: userId, socket, username, roomId };
                allSockets.set(userId,newUser);
                rooms.get(roomId)?.push(newUser)

                console.log(`${username} joined room: ${roomId}`);


                //notify this to everyone in the room
                broadcast(roomId, {
                    type: "user-joined",
                    message: `${username} joined the room`,
                    users: rooms.get(roomId)?.map((user) => user.username)
                })
            }

            else if (data.type === "message") {
                let { roomId, text, username } = data;

                broadcast(roomId, {
                    type: "message",
                    text,
                    username
                })
            }
        } catch (error) {
            console.log("Error processing message:", error);
        }
    })

    // HANDLE DISCONNECTION
    // ✅ Finds the user in allSockets and removes them.
    // ✅ Removes them from their room.
    // ✅ If the room is empty, it gets deleted.
    // ✅ Notifies all remaining users.
    socket.on("close",()=>{
        console.log("A user disconnected.");


        let disconnectedUser: ConnectedUser | undefined;
        allSockets.forEach((user, userId) => {
            if (user.socket === socket) {
                disconnectedUser = user;
                allSockets.delete(userId);
            }
        });


        if (disconnectedUser) {
            let { roomId, username } = disconnectedUser;
            let usersInRoom = rooms.get(roomId) || [];
            rooms.set(roomId, usersInRoom.filter((user) => user.id !== disconnectedUser?.id));

            // If the room is empty, delete it
            if (rooms.get(roomId)?.length === 0) {
                rooms.delete(roomId);
            }

            // Notify remaining users
            broadcast(roomId, {
                type: "user-left",
                message: `${username} left the room.`,
            });

            console.log(`[LEAVE] ${username} left room: ${roomId}`);
        }
    })
})



function broadcast(roomId: string, message: object){
    if(rooms.has(roomId)){
        rooms.get(roomId)?.forEach((user) => {
            if(user.socket.readyState === WebSocket.OPEN){
                user.socket.send(JSON.stringify(message));
            }
        })
    }
}


function generateRoomId(): string{
    return Math.random().toString(36).substring(2,8).toUpperCase();
}
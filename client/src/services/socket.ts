// let socket : WebSocket | null = null;

// export const initializeSocket = () : WebSocket => {
//   if(socket && socket.readyState === WebSocket.OPEN) {
//     return socket;
//   }

//   const wsUrl = 'ws://localhost:8080';
//   socket = new WebSocket(wsUrl);

//   socket.onopen = () => {
//     console.log("WebSocket connection established");
//   };

//   socket.onclose = () => {
//     console.log("WebSocket connection closed");
//   };

//   return socket;

// }



// export const getSocket = () : WebSocket => {
//   if(!socket || socket.readyState !== WebSocket.OPEN) {
//     return initializeSocket();
//   }

//   return socket;
// }



// export const closeSocket = () => {
//   if(socket) {
//     socket.close();
//     socket = null;
//   }
//   console.log("WebSocket connection closed");
// }


// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export const sendMessage = (type : string ,  payload : any) => {
//   const socket = getSocket();
//   const message = JSON.stringify({ type, ...payload });
//   socket.send(message);
//   console.log("Message sent:", message);
// }

// export const createRoom = () => {
//   sendMessage('create-room', {});
// };

// export const joinRoom = (roomId: string, username: string) => {
//   sendMessage('join', { roomId, username });
// };

// export const sendChatMessage = (roomId: string, username: string, text: string) => {
//   sendMessage('message', { roomId, username, text });
// };

let socket: WebSocket | null = null;

// const wsUrl = 'ws://localhost:8080';
const wsUrl = 'wss://broadcastsocket.onrender.com';

export const initializeSocket = (): WebSocket => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connection established");
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };

  return socket;
};

export const getSocket = (): WebSocket => {
  if (!socket) {
    socket = initializeSocket();
  }

  return socket;
};


export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  console.log("WebSocket connection closed");
};

// Helper to wait for socket to be OPEN
const waitForSocketOpen = (socket: WebSocket): Promise<void> => {
  return new Promise((resolve) => {
    if (socket.readyState === WebSocket.OPEN) {
      resolve();
    } else {
      socket.addEventListener("open", () => resolve(), { once: true });
    }
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendMessage = async (type: string, payload: any) => {
  const socket = getSocket();
  await waitForSocketOpen(socket);

  const message = JSON.stringify({ type, ...payload });
  socket.send(message);
  console.log("Message sent:", message);
};

export const createRoom = async () => {
  await sendMessage("create-room", {});
};

export const joinRoom = async (roomId: string, username: string) => {
  console.log(`Attempting to join room: ${roomId} as ${username}`);
  await sendMessage("join", { roomId, username });
};

export const sendChatMessage = async (roomId: string, username: string, text: string) => {
  await sendMessage("message", { roomId, username, text });
};

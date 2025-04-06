/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createRoom, getSocket } from '../services/socket';
import { useRouter } from 'next/router';

const RoomList = () => {
  const [rooms, setRooms] = useState<string[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const socket = getSocket();
    
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'room-created') {
        router.push(`/room?id=${data.roomId}`);
      }
    };
    
    socket.addEventListener('message', handleMessage);
    
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [router]);

  const handleCreateRoom = () => {
    createRoom();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rooms</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleCreateRoom} className="w-full mb-4">
          Create New Room
        </Button>
        <ul className="space-y-2">
          {rooms.map((roomId) => (
            <li key={roomId} className="bg-gray-100 p-2 rounded">
              Room: {roomId}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RoomList;
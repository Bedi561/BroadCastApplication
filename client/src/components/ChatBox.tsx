import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSocket, sendChatMessage } from '../services/socket';
import Message from './Message';

interface ChatMessage {
  username: string;
  text: string;
  timestamp: Date;
}

interface ChatBoxProps {
  roomId: string;
  username: string;
}

const ChatBox = ({ roomId, username }: ChatBoxProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const socket = getSocket();
    
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        setMessages(prev => [
          ...prev, 
          { 
            username: data.username, 
            text: data.text, 
            timestamp: new Date() 
          }
        ]);
      }
      
      // Handle other message types like user-joined, user-left
      if (data.type === 'user-joined' || data.type === 'user-left') {
        setMessages(prev => [
          ...prev, 
          { 
            username: 'System', 
            text: data.message, 
            timestamp: new Date() 
          }
        ]);
      }
    };
    
    socket.addEventListener('message', handleMessage);
    
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendChatMessage(roomId, username, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Chat Room: {roomId}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-[70vh]">
        <ScrollArea className="flex-1 mb-4 max-h-[calc(70vh-120px)]">
          <div className="space-y-4" ref={scrollAreaRef}>
            {messages.map((msg, index) => (
              <Message 
                key={index}
                content={msg.text}
                sender={msg.username}
                timestamp={msg.timestamp}
                isCurrentUser={msg.username === username}
              />
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input 
            placeholder="Type a message..." 
            className="flex-1" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatBox;
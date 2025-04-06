/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardCopy, MessageCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useSetRecoilState } from "recoil";
import { roomIdAtom, userNameAtom } from "@/recoil/roomState";
import { toast } from "sonner";
import { getSocket, createRoom } from "../services/socket";

const Index = () => {
  const setRoomIdGlobal = useSetRecoilState(roomIdAtom);
  const setUserNameGlobal = useSetRecoilState(userNameAtom);

  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [creating, setCreating] = useState(false);
  const [generatedRoomCode, setGeneratedRoomCode] = useState("");
  const router = useRouter();

  useEffect(() => {
    const socket = getSocket();

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "room-created") {
          const newRoomId = data.roomId;
          setGeneratedRoomCode(newRoomId);
          setCreating(false);
        } else if (data.type === "error") {
          toast.error(data.message || "Something went wrong");
          setCreating(false);
        }
      } catch (err) {
        console.error("Invalid WebSocket message:", event.data);
        setCreating(false);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, []);

  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      toast.error("Please enter your name before creating a room");
      return;
    }

    setCreating(true);
    try {
      await createRoom();
    } catch (err) {
      toast.error("Error creating room");
      setCreating(false);
    }
  };

  const handleJoinRoom = () => {
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!generatedRoomCode && !roomId.trim()) {
      toast.error("Please enter a room code");
      return;
    }

    const finalRoomId = generatedRoomCode || roomId.trim();
    const cleanName = userName.trim();

    setUserNameGlobal(cleanName);
    setRoomIdGlobal(finalRoomId);
    sessionStorage.setItem("userName", cleanName);
    sessionStorage.setItem("roomId", finalRoomId);

    router.push("/room");
  };

  const copyToClipboard = () => {
    if (generatedRoomCode) {
      navigator.clipboard.writeText(generatedRoomCode);
      toast.success("Room code copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-[#0E0E0E] border border-[#333] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="text-white" size={24} />
          <h1 className="text-white font-mono text-2xl">Real Time Chat</h1>
        </div>
        <p className="text-gray-400 font-mono text-sm mb-6">
          Temporary room that expires after all users exit
        </p>

        <Input
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="font-mono bg-transparent text-white border-[#333] mb-4 h-12 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <Button
          variant="outline"
          onClick={handleCreateRoom}
          disabled={creating}
          className="w-full bg-transparent text-white border border-[#333] hover:bg-[#111] font-mono mb-4 h-12"
        >
          {creating ? "Creating Room..." : "Create New Room"}
        </Button>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter Room Code"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="font-mono bg-transparent text-white border-[#333] h-12 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            variant="outline"
            onClick={handleJoinRoom}
            className="bg-white text-black font-mono hover:bg-gray-100 h-12 min-w-[120px]"
          >
            Join Room
          </Button>
        </div>

        {generatedRoomCode && (
          <div className="mt-4 bg-[#1A1A1A] rounded p-4">
            <p className="text-gray-400 font-mono text-center mb-2">
              Share this code with your friend
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-white font-mono text-2xl">
                {generatedRoomCode}
              </span>
              <button
                onClick={copyToClipboard}
                className="text-gray-400 hover:text-white"
              >
                <ClipboardCopy size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

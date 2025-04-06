/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useRecoilState, useRecoilValue } from "recoil";
import { roomIdAtom, userNameAtom } from "@/recoil/roomState";
import ChatBox from "../components/ChatBox";
import UserList from "../components/UserList";
import { joinRoom, getSocket } from "../services/socket";
import { toast } from "sonner";

export default function Room() {
  const router = useRouter();
  const [roomId, setRoomId] = useRecoilState(roomIdAtom);
  const [userName, setUserName] = useRecoilState(userNameAtom);

  const [users, setUsers] = useState<string[]>([]);
  const hasJoinedRef = useRef(false);

  // Hydrate Recoil state from sessionStorage if needed
  useEffect(() => {
    const storedRoomId = sessionStorage.getItem("roomId");
    const storedUserName = sessionStorage.getItem("userName");

    if (storedRoomId && storedUserName) {
      setRoomId(storedRoomId);
      setUserName(storedUserName);
    }
  }, []);

  // Join room after hydration
  useEffect(() => {
    if (!roomId || !userName || hasJoinedRef.current) return;

    joinRoom(roomId, userName);
    hasJoinedRef.current = true;
    console.log("Joining room:", roomId, "with user:", userName);
  }, [roomId, userName]);

  // Listen for user updates via socket
  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "user-joined" || data.type === "user-left") {
        if (data.users) {
          setUsers(data.users);
        }
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [roomId]);

  // Warn before page unload
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, []);

  // Exit room
  const handleExit = () => {
    toast.info("You have left the chat.");
    sessionStorage.removeItem("roomId");
    sessionStorage.removeItem("userName");
    setRoomId("");
    setUserName("");
    router.push("/");
  };

  if (!roomId || !userName) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-pulse">Joining chat room...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Head>
        <title>Chat Room: {roomId}</title>
        <meta name="description" content={`Live chat room ${roomId}`} />
      </Head>

      <header className="bg-gray-800 p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Room: {roomId}</h1>
          <button
            onClick={handleExit}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Exit Chat
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <UserList users={users} />
          </div>
          <div className="md:col-span-3 bg-gray-800 rounded-lg shadow-lg">
            <ChatBox roomId={roomId} username={userName} />
          </div>
        </div>
      </main>
    </div>
  );
}

interface MessageProps {
    content: string;
    sender: string;
    timestamp: Date;
    isCurrentUser?: boolean;
  }
  
  const Message = ({ content, sender, timestamp, isCurrentUser = false }: MessageProps) => {
    return (
      <div className={`mb-4 ${isCurrentUser ? 'text-right' : ''}`}>
        <div className="flex items-center mb-1">
          <span className="font-bold">{sender}</span>
          <span className="text-xs text-gray-500 ml-2">
            {timestamp.toLocaleTimeString()}
          </span>
        </div>
        <p className={`p-2 rounded inline-block ${
          isCurrentUser 
            ? 'bg-blue-500 text-white' 
            : sender === 'System' 
              ? 'bg-gray-300 italic' 
              : 'bg-gray-100'
        }`}>
          {content}
        </p>
      </div>
    );
  };
  
  export default Message;
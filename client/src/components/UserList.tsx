import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserListProps {
  users: string[];
}

const UserList = ({ users = [] }: UserListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {users.map((username) => (
            <li key={username} className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{username}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default UserList;
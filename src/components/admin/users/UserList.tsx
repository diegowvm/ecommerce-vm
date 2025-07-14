import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Eye, Shield, User, Crown } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  user_roles?: { role: string }[];
}

interface UserListProps {
  users: UserProfile[];
  loading: boolean;
  onUserClick: (user: UserProfile) => void;
  onUpdateRole: (userId: string, role: string) => void;
}

export function UserList({ users, loading, onUserClick, onUpdateRole }: UserListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getUserRole = (user: UserProfile) => {
    return user.user_roles?.[0]?.role || 'user';
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Admin
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <User className="w-3 h-3" />
        Usuário
      </Badge>
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const toggleUserRole = (user: UserProfile) => {
    const currentRole = getUserRole(user);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (confirm(`Tem certeza que deseja alterar o papel deste usuário para ${newRole === 'admin' ? 'Administrador' : 'Usuário'}?`)) {
      onUpdateRole(user.user_id, newRole);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-4">
            <Eye className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
          <p className="text-muted-foreground">
            Nenhum usuário corresponde aos critérios de busca.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell onClick={() => onUserClick(user)}>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.full_name || 'Nome não informado'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {user.user_id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => onUserClick(user)}>
                    <div>
                      {user.phone && (
                        <p className="text-sm">{user.phone}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {user.user_id.slice(0, 8)}...@user
                      </p>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => onUserClick(user)}>
                    {getRoleBadge(getUserRole(user))}
                  </TableCell>
                  <TableCell onClick={() => onUserClick(user)}>
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUserClick(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserRole(user)}
                        className={getUserRole(user) === 'admin' ? 'text-orange-600' : 'text-blue-600'}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        {getUserRole(user) === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
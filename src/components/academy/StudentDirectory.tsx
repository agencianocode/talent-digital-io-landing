import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAcademyData } from '@/hooks/useAcademyData';
import { toast } from 'sonner';
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  UserX,
  Mail,
  Calendar,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StudentDirectoryProps {
  academyId: string;
  onInviteClick?: () => void;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({ academyId, onInviteClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { students, loadStudents, removeStudent, isLoading } = useAcademyData(academyId);

  // Load students when filters change
  useEffect(() => {
    loadStudents({ 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchTerm || undefined 
    });
  }, [statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'graduated': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'graduated': return 'Graduado';
      case 'paused': return 'Pausado';
      case 'suspended': return 'Suspendido';
      default: return status;
    }
  };

  // Filter locally by search term
  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return student.talent_profiles?.full_name?.toLowerCase().includes(searchLower) ||
      student.talent_profiles?.email?.toLowerCase().includes(searchLower);
  });

  const handleRemoveStudent = async (studentEmail: string) => {
    if (!confirm('¿Estás seguro de que deseas desligar este estudiante de la academia?')) {
      return;
    }

    const success = await removeStudent(studentEmail);
    if (success) {
      toast.success('Estudiante desligado correctamente');
    } else {
      toast.error('Error al desligar estudiante');
    }
  };

  const handleSendMessage = (_userId: string) => {
    // TODO: Implement send message navigation
    toast.info('Función de mensajería próximamente');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Directorio de Estudiantes</h2>
          <p className="text-muted-foreground">
            Gestiona los estudiantes de tu academia
          </p>
        </div>
        <Button onClick={onInviteClick}>
          <Users className="h-4 w-4 mr-2" />
          Invitar Estudiantes
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="graduated">Graduado</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="suspended">Suspendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-primary animate-pulse mb-4" />
              <p>Cargando estudiantes...</p>
            </CardContent>
          </Card>
        ) : filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay estudiantes</h3>
              <p className="text-muted-foreground text-center mb-4">
                {students.length === 0 
                  ? 'Aún no tienes estudiantes en tu academia'
                  : 'No se encontraron estudiantes con los filtros aplicados'
                }
              </p>
              {students.length === 0 && (
                <Button onClick={onInviteClick}>
                  <Users className="h-4 w-4 mr-2" />
                  Invitar Primer Estudiante
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={student.talent_profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {student.talent_profiles?.full_name?.charAt(0) || 'E'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {student.talent_profiles?.full_name || 'Estudiante'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Mail className="w-4 h-4" />
                          <span>{student.talent_profiles?.email}</span>
                          {student.talent_profiles?.city && (
                            <>
                              <span>•</span>
                              <MapPin className="w-4 h-4" />
                              <span>{student.talent_profiles.city}, {student.talent_profiles.country}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Se unió: {new Date(student.joined_at).toLocaleDateString()}
                          </span>
                          {student.graduation_date && (
                            <>
                              <span>•</span>
                              <span>
                                Graduado: {new Date(student.graduation_date).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(student.status)} text-xs`}>
                          {getStatusText(student.status)}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSendMessage(student.user_id)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Enviar Mensaje
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRemoveStudent(student.talent_profiles?.email || student.user_id)}
                              className="text-red-600"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Desligar Estudiante
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentDirectory;

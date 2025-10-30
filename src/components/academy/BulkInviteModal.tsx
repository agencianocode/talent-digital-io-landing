import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BulkInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academyId: string;
  onSuccess?: () => void;
}

interface StudentImport {
  email: string;
  name?: string;
  program?: string;
  enrollmentDate?: string;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
}

export const BulkInviteModal = ({ open, onOpenChange, academyId, onSuccess }: BulkInviteModalProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [students, setStudents] = useState<StudentImport[]>([]);
  const [defaultProgram, setDefaultProgram] = useState('');
  const [importing, setImporting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.csv')) {
      toast({
        title: 'Error',
        description: 'Por favor sube un archivo CSV',
        variant: 'destructive',
      });
      return;
    }

    setFile(uploadedFile);
    parseCSV(uploadedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row
      const dataLines = lines.slice(1);
      
      const parsedStudents: StudentImport[] = [];
      
      for (const line of dataLines) {
        const [email, name, program, enrollmentDate] = line.split(',').map(s => s.trim());
        if (email && email.includes('@')) {
          parsedStudents.push({
            email,
            name: name || undefined,
            program: program || undefined,
            enrollmentDate: enrollmentDate || undefined,
            status: 'pending' as const,
          });
        }
      }


      setStudents(parsedStudents);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (students.length === 0) {
      toast({
        title: 'Error',
        description: 'No hay estudiantes para importar',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);

    try {
      // Import students one by one
      const updatedStudents = [...students];
      
      for (let i = 0; i < updatedStudents.length; i++) {
        const student = updatedStudents[i];
        if (!student) continue;
        
        try {
          const { error } = await supabase
            .from('academy_students')
            .insert({
              academy_id: academyId,
              student_email: student.email,
              student_name: student.name,
              program_name: student.program || defaultProgram,
              enrollment_date: student.enrollmentDate || new Date().toISOString().split('T')[0],
              status: 'enrolled',
            });

          if (error) throw error;

          updatedStudents[i]!.status = 'success';
        } catch (error: any) {
          updatedStudents[i]!.status = 'error';
          updatedStudents[i]!.errorMessage = error.message;
        }

        setStudents([...updatedStudents]);
      }

      const successCount = updatedStudents.filter(s => s.status === 'success').length;
      const errorCount = updatedStudents.filter(s => s.status === 'error').length;

      toast({
        title: 'Importación completada',
        description: `${successCount} estudiantes importados exitosamente${errorCount > 0 ? `, ${errorCount} con errores` : ''}`,
      });

      if (successCount > 0 && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error importing students:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error durante la importación',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Estudiantes Masivamente</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV con la lista de estudiantes. El formato debe ser: email, nombre, programa, fecha_ingreso
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultProgram">Programa por Defecto (opcional)</Label>
            <Input
              id="defaultProgram"
              value={defaultProgram}
              onChange={(e) => setDefaultProgram(e.target.value)}
              placeholder="Ej: Desarrollo Web Full Stack"
            />
            <p className="text-xs text-muted-foreground">
              Se usará para estudiantes sin programa especificado en el CSV
            </p>
          </div>

          <div className="border-2 border-dashed rounded-lg p-6">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <Label htmlFor="csvFile" className="cursor-pointer text-primary hover:underline">
                {file ? file.name : 'Selecciona un archivo CSV'}
              </Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground text-center">
                Formato: email,nombre,programa,fecha_ingreso<br />
                Ejemplo: juan@email.com,Juan Pérez,Desarrollo Web,2024-01-01
              </p>
            </div>
          </div>

          {students.length > 0 && (
            <div className="border rounded-lg">
              <div className="p-3 bg-muted font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Vista Previa ({students.length} estudiantes)
              </div>
              <div className="max-h-64 overflow-y-auto">
                {students.map((student, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 border-t hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{student.email}</div>
                      {student.name && (
                        <div className="text-sm text-muted-foreground">{student.name}</div>
                      )}
                      {(student.program || defaultProgram) && (
                        <div className="text-xs text-muted-foreground">
                          {student.program || defaultProgram}
                        </div>
                      )}
                    </div>
                    <div>
                      {student.status === 'success' && (
                        <Check className="h-5 w-5 text-green-600" />
                      )}
                      {student.status === 'error' && (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                      {student.status === 'pending' && importing && (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={importing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={students.length === 0 || importing}
            >
              {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Importar Estudiantes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Linkedin, Calendar, MapPin, Briefcase, GraduationCap } from 'lucide-react';

// Mock talent profiles - in a real app, this would come from an API
const talentProfiles = {
  'talent_1': {
    id: 'talent_1',
    name: 'Ana García López',
    title: 'Especialista en Ventas B2B',
    email: 'ana.garcia@email.com',
    linkedin: 'https://linkedin.com/in/ana-garcia-lopez',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=talent1',
    location: 'Madrid, España',
    bio: 'Profesional de ventas con más de 5 años de experiencia en el sector tecnológico. Especializada en ventas consultivas y desarrollo de relaciones comerciales a largo plazo.',
    experience: [
      {
        position: 'Senior Sales Executive',
        company: 'TechCorp Solutions',
        period: '2022 - Presente',
        description: 'Responsable de la gestión de cuentas estratégicas y desarrollo de nuevos negocios en el sector empresarial.'
      },
      {
        position: 'Sales Representative',
        company: 'Digital Solutions Inc.',
        period: '2020 - 2022',
        description: 'Desarrollo de estrategias de venta y mantenimiento de cartera de clientes B2B.'
      }
    ],
    education: [
      {
        degree: 'Máster en Administración de Empresas',
        institution: 'Universidad Complutense de Madrid',
        year: '2020'
      },
      {
        degree: 'Grado en Comercio y Marketing',
        institution: 'Universidad Autónoma de Madrid',
        year: '2018'
      }
    ],
    skills: ['Ventas B2B', 'CRM', 'Negociación', 'Presentaciones', 'Análisis de mercado', 'Gestión de clientes']
  }
};

const TalentProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const talent = talentProfiles[id as keyof typeof talentProfiles] || talentProfiles['talent_1'];

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex items-start space-x-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={talent.photo} />
              <AvatarFallback className="text-2xl">
                {talent.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {talent.name}
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                {talent.title}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {talent.location}
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {talent.email}
                </div>
                <div className="flex items-center">
                  <Linkedin className="h-4 w-4 mr-1" />
                  <a href={talent.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    LinkedIn
                  </a>
                </div>
              </div>

              <p className="text-foreground leading-relaxed">
                {talent.bio}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Experiencia Laboral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {talent.experience.map((exp, index) => (
              <div key={index} className="border-l-2 border-primary pl-4">
                <h3 className="font-semibold text-foreground">{exp.position}</h3>
                <p className="text-primary font-medium">{exp.company}</p>
                <p className="text-sm text-muted-foreground mb-2">{exp.period}</p>
                <p className="text-sm text-foreground">{exp.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Formación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {talent.education.map((edu, index) => (
              <div key={index}>
                <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                <p className="text-primary">{edu.institution}</p>
                <p className="text-sm text-muted-foreground">{edu.year}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Habilidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {talent.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Actions */}
      <div className="mt-8 flex justify-center">
        <Button size="lg">
          <Mail className="h-4 w-4 mr-2" />
          Contactar Candidato
        </Button>
      </div>
    </div>
  );
};

export default TalentProfilePage;
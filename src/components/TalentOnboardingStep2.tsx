import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Check } from 'lucide-react';
import { categoryTemplates } from '@/lib/opportunityTemplates';

interface ProfessionalInfo {
  title: string;
  category: string;
  category2?: string;
  experience: string;
  bio: string;
  skills: string[];
}

interface TalentOnboardingStep2Props {
  onComplete: (data: ProfessionalInfo) => void;
  initialData: ProfessionalInfo;
}

const TalentOnboardingStep2 = ({ onComplete, initialData }: TalentOnboardingStep2Props) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [category, setCategory] = useState(initialData.category || '');
  const [category2, setCategory2] = useState(initialData.category2 || '');
  const [experience, setExperience] = useState(initialData.experience || '');
  const [bio, setBio] = useState(initialData.bio || '');
  const [skills, setSkills] = useState<string[]>(initialData.skills || []);
  const [skillInput, setSkillInput] = useState('');

  // Categorías principales (áreas generales)
  const mainCategories = [
    'Ventas',
    'Marketing',
    'Creativo',
    'Atención al Cliente',
    'Operaciones',
    'Tecnología y Automatizaciones',
    'Soporte Profesional (Asistentes Administrativos, Contadores, Abogados, etc.)'
  ];

  // Categorías secundarias (especializaciones específicas)
  const secondaryCategories = [
    'Ventas',
    'Marketing',
    'Creativo',
    'Atención al Cliente',
    'Operaciones',
    'Tecnología y Automatizaciones',
    'Soporte Profesional (Asistentes Administrativos, Contadores, Abogados, etc.)'
  ];

  const experienceLevels = [
    'Principiante: 0-1 año',
    'Intermedio: 1-3 años',
    'Avanzado: 3-6 años',
    'Experto: +6 años'
  ];

  // Get suggested skills based on selected category
  const getSuggestedSkills = () => {
    if (!category) return [];
    const template = categoryTemplates[category];
    return template?.skills || [];
  };

  // Funciones para manejar habilidades
  const MAX_SKILL_LENGTH = 30;

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill.length > MAX_SKILL_LENGTH) {
      return;
    }
    if (trimmedSkill && skills.length < 3 && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  // Funciones para manejar categorías
  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const handleCategory2Change = (value: string) => {
    setCategory2(value === 'none' ? '' : value);
  };


  // Validar si el formulario está completo (categoría secundaria es opcional)
  const isFormValid = title.trim().length > 0 && category.length > 0 && 
                     experience.length > 0 && bio.trim().length >= 50;

  const handleContinue = () => {
    if (!isFormValid) return;
    
    onComplete({
      title,
      category,
      category2,
      experience,
      bio,
      skills
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-center mx-auto px-6 py-6 space-y-6 font-['Inter']">
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-black font-['Inter']">
          Contanos qué haces y en qué sos experto
        </h1>
        <p className="text-gray-600 font-['Inter'] text-xs">
          Cuéntanos sobre tu experiencia y especialización
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4 flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
        {/* Category Fields */}
        <div className="space-y-4">
          {/* Categoría Principal */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-700 font-['Inter']">
                Categoría principal en la que desarrollas tu actividad *
              </label>
              {category && <Check className="w-4 h-4 text-green-600" />}
            </div>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="h-11 text-sm border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter'] bg-white">
                <SelectValue placeholder="Selecciona tu área principal" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {mainCategories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="font-['Inter']">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categoría Secundaria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
              Categoría Secundaria (Opcional)
            </label>
            <Select value={category2} onValueChange={handleCategory2Change}>
              <SelectTrigger className="h-11 text-sm border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter'] bg-white">
                <SelectValue placeholder="Selecciona una segunda área (opcional)" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="none" className="font-['Inter'] text-gray-500">
                  Sin categoría secundaria
                </SelectItem>
                {secondaryCategories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="font-['Inter']">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500 font-['Inter']">
              Si tenés más de un enfoque profesional, agregá una segunda área.
            </p>
          </div>
        </div>

        {/* Title */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 font-['Inter']">Título profesional *</label>
            {title.trim() && <Check className="w-4 h-4 text-green-600" />}
          </div>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Closer de Ventas High Ticket especializado en Infoproductos"
            maxLength={60}
            className="h-11 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter'] bg-white"
          />
          <div className="mt-1 flex justify-between items-center">
            <p className="text-xs text-gray-500 font-['Inter']">Esta frase se mostrará como tu título principal en el perfil.</p>
            <span className="text-xs text-gray-400 font-['Inter']">{title.length}/60</span>
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 font-['Inter']">Nivel de Experiencia *</label>
            {experience && <Check className="w-4 h-4 text-green-600" />}
          </div>
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger className="h-11 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter'] bg-white">
              <SelectValue placeholder="Seleccione su nivel de experiencia" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              {experienceLevels.map((level) => (
                <SelectItem key={level} value={level} className="font-['Inter']">
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-gray-500 font-['Inter']">Indique su nivel de experiencia profesional.</p>
        </div>

        {/* Bio */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 font-['Inter']">Bio *</label>
            {bio.trim().length >= 50 && <Check className="w-4 h-4 text-green-600" />}
          </div>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Cuéntanos brevemente tu experiencia, tus resultados o qué te apasiona del trabajo que hacés..."
            className="min-h-20 text-base border border-gray-300 rounded-lg px-4 py-3 focus:border-gray-400 focus:ring-0 font-['Inter'] resize-none bg-white"
          />
          <div className="mt-1 flex justify-between items-center">
            <p className={`text-xs font-['Inter'] ${bio.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
              {bio.length >= 50 ? '✓ Mínimo alcanzado' : 'Mínimo 50 caracteres'}
            </p>
            <span className="text-xs text-gray-400 font-['Inter']">{bio.length} caracteres</span>
          </div>
        </div>

        {/* Skills */}
        <div>
          <div className="mb-1">
            <label className="text-sm font-medium text-gray-700 font-['Inter']">Habilidades</label>
          </div>
          
          {/* Suggested skills based on category */}
          {category && getSuggestedSkills().length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2 font-['Inter']">Sugerencias basadas en tu categoría:</p>
              <div className="flex flex-wrap gap-2">
                {getSuggestedSkills().slice(0, 10).map((suggestedSkill) => (
                  <button
                    key={suggestedSkill}
                    type="button"
                    onClick={() => {
                      if (skills.length < 3 && !skills.includes(suggestedSkill)) {
                        setSkills([...skills, suggestedSkill]);
                      }
                    }}
                    disabled={skills.includes(suggestedSkill) || skills.length >= 3}
                    className="px-3 py-1 rounded-full text-sm font-['Inter'] transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                  >
                    + {suggestedSkill}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Tags de habilidades */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-['Inter'] border border-green-200"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input para agregar habilidades */}
          {skills.length < 3 && (
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleSkillKeyPress}
                  placeholder="Añade una habilidad (máx. 30 caracteres)"
                  maxLength={30}
                  className="h-11 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter'] bg-white"
                />
                <p className="text-xs text-gray-400 text-right font-['Inter']">{skillInput.length}/30</p>
              </div>
              <Button
                type="button"
                onClick={addSkill}
                disabled={!skillInput.trim() || skills.includes(skillInput.trim())}
                variant="secondary"
                className="h-11 px-4 rounded-lg font-['Inter']"
              >
                +
              </Button>
            </div>
          )}

          <div className="mt-1 flex justify-between items-center">
            <p className="text-xs text-gray-500 font-['Inter']">Agregá hasta 3 habilidades clave</p>
            <span className="text-xs text-gray-400 font-['Inter']">{skills.length}/3</span>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-2">
          <Button
            onClick={handleContinue}
            disabled={!isFormValid}
            variant="default"
            className="w-full h-11 rounded-lg font-medium text-sm font-['Inter']"
          >
            Completar perfil
          </Button>
          
          {/* Feedback message for missing fields */}
          {!isFormValid && (
            <p className="text-xs text-amber-600 text-center mt-2 font-['Inter']">
              {!category ? "⚠️ Por favor selecciona tu categoría principal" :
               !title.trim() ? "⚠️ Por favor ingresa tu título profesional" :
               !experience ? "⚠️ Por favor selecciona tu nivel de experiencia" :
               bio.trim().length < 50 ? `⚠️ Tu bio necesita ${50 - bio.trim().length} caracteres más` : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentOnboardingStep2;

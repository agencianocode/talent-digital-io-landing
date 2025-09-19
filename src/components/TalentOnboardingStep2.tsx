import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

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
  const [customCategory, setCustomCategory] = useState('');
  const [customCategory2, setCustomCategory2] = useState('');

  // Categorías principales (áreas generales)
  const mainCategories = [
    'Comercial',
    'Tecnología',
    'Marketing',
    'Diseño',
    'Operaciones',
    'Finanzas',
    'Recursos Humanos',
    'Legal',
    'Consultoría',
    'Otros'
  ];

  // Categorías secundarias (especializaciones específicas)
  const secondaryCategories = [
    'Closer de Ventas',
    'Content Manager',
    'Community Manager',
    'Social Media Manager',
    'SEO Specialist',
    'PPC Specialist',
    'Email Marketing',
    'Brand Manager',
    'Product Manager',
    'Project Manager',
    'Scrum Master',
    'Business Analyst',
    'Data Analyst',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Mobile Developer',
    'DevOps Engineer',
    'UI/UX Designer',
    'Graphic Designer',
    'Motion Graphics',
    'Video Editor',
    'Photographer',
    'Copywriter',
    'Technical Writer',
    'Account Manager',
    'Customer Success',
    'Operations Manager',
    'Supply Chain',
    'Financial Analyst',
    'HR Specialist',
    'Legal Advisor',
    'Consultant',
    'Trainer',
    'Coach',
    'Otros'
  ];

  const experienceLevels = [
    'Estudiante',
    'Junior (0-2 años)',
    'Mid-level (2-5 años)',
    'Senior (5+ años)',
    'Lead/Architect (8+ años)'
  ];

  // Funciones para manejar habilidades
  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
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

  // Funciones para manejar categorías personalizadas
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    if (value !== 'Otros') {
      setCustomCategory('');
    }
  };

  const handleCategory2Change = (value: string) => {
    setCategory2(value);
    if (value !== 'Otros') {
      setCustomCategory2('');
    }
  };


  // Validar si el formulario está completo (categoría secundaria es opcional)
  const isFormValid = title.trim().length > 0 && category.length > 0 && 
                     experience.length > 0 && bio.trim().length > 0;

  const handleContinue = () => {
    if (!isFormValid) return;
    
    // Usar categoría personalizada si se seleccionó "Otros"
    const finalCategory = category === 'Otros' && customCategory ? customCategory : category;
    const finalCategory2 = category2 === 'Otros' && customCategory2 ? customCategory2 : category2;
    
    onComplete({
      title,
      category: finalCategory,
      category2: finalCategory2,
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
          Información Profesional
        </h1>
        <p className="text-gray-600 font-['Inter'] text-xs">
          Cuéntanos sobre tu experiencia y especialización
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4 flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
        {/* Category Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="h-11 text-sm border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter'] bg-white">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {mainCategories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="font-['Inter']">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {category === 'Otros' && (
              <Input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Especifica tu categoría"
                className="mt-2 h-11 text-sm border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter'] bg-white"
              />
            )}
          </div>
          <div>
            <Select value={category2} onValueChange={handleCategory2Change}>
              <SelectTrigger className="h-11 text-sm border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter'] bg-white">
                <SelectValue placeholder="Categoría 2 (Opcional)" />
              </SelectTrigger>
              <SelectContent>
                {secondaryCategories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="font-['Inter']">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {category2 === 'Otros' && (
              <Input
                type="text"
                value={customCategory2}
                onChange={(e) => setCustomCategory2(e.target.value)}
                placeholder="Especifica tu especialización"
                className="mt-2 h-11 text-sm border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter'] bg-white"
              />
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <div className="mb-1">
            <label className="text-sm font-medium text-gray-700 font-['Inter']">Una sola línea</label>
          </div>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Desarrollador web que crea sitios web modernos y responsivos."
            className="h-11 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter'] bg-white"
          />
          <div className="mt-1 flex justify-between items-center">
            <p className="text-xs text-gray-500 font-['Inter']">Resalte su enfoque creativo.</p>
            <span className="text-xs text-gray-400 font-['Inter']">{title.length}/60</span>
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <div className="mb-1">
            <label className="text-sm font-medium text-gray-700 font-['Inter']">Nivel de Experiencia</label>
          </div>
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger className="h-11 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter'] bg-white">
              <SelectValue placeholder="Seleccione su nivel de experiencia" />
            </SelectTrigger>
            <SelectContent>
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
          <div className="mb-1">
            <label className="text-sm font-medium text-gray-700 font-['Inter']">Bio</label>
          </div>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Cuéntanos sobre ti, tu experiencia y qué te apasiona..."
            className="min-h-16 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter'] resize-none bg-white"
          />
          <p className="mt-1 text-xs text-gray-500 font-['Inter']">Describa su experiencia y pasión profesional.</p>
        </div>

        {/* Skills */}
        <div>
          <div className="mb-1">
            <label className="text-sm font-medium text-gray-700 font-['Inter']">Habilidades</label>
          </div>
          
          {/* Tags de habilidades */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-['Inter']"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
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
              <Input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleSkillKeyPress}
                placeholder="Añade una habilidad"
                className="flex-1 h-11 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter'] bg-white"
              />
              <Button
                type="button"
                onClick={addSkill}
                disabled={!skillInput.trim() || skills.includes(skillInput.trim())}
                className="h-11 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-['Inter'] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </Button>
            </div>
          )}

          <div className="mt-1 flex justify-between items-center">
            <p className="text-xs text-gray-500 font-['Inter']">Diseñador de marca, redactor, gerente de proyectos, etc.</p>
            <span className="text-xs text-gray-400 font-['Inter']">{skills.length}/3</span>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-2">
          <Button
            onClick={handleContinue}
            disabled={!isFormValid}
            className={`w-full h-11 rounded-lg font-medium text-sm font-['Inter'] transition-all ${
              isFormValid
                ? 'bg-black hover:bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Completar perfil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TalentOnboardingStep2;

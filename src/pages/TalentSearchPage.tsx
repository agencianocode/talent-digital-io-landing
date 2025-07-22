import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const TalentSearchPage = () => {
  const navigate = useNavigate();

  // Mock talent profiles
  const talentProfiles = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Perfil de Talento ${i + 1}`,
  }));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Buscar..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          onClick={() => navigate('/dashboard/opportunities/new')}
          className="font-semibold"
        >
          Publicar Oportunidad
        </Button>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Explorar Talento
      </h1>

      {/* Talent Grid */}
      <div className="grid grid-cols-4 gap-6">
        {talentProfiles.map((profile) => (
          <div 
            key={profile.id}
            className="bg-secondary rounded-lg h-64 flex items-center justify-center cursor-pointer hover:bg-card-hover transition-colors"
          >
            <span className="text-foreground font-medium text-center px-4">
              {profile.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TalentSearchPage;
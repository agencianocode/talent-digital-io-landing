import { useNavigate } from "react-router-dom";

const UserSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Business Card */}
          <div 
            className="bg-secondary p-12 rounded-2xl cursor-pointer transition-colors hover:bg-card-hover group"
            onClick={() => navigate('/business-dashboard')}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                Busco Talento para mi negocio
              </h2>
            </div>
          </div>

          {/* Talent Card */}
          <div 
            className="bg-secondary p-12 rounded-2xl cursor-pointer transition-colors hover:bg-card-hover group"
            onClick={() => navigate('/talent-dashboard')}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                Busco trabajo
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSelector;
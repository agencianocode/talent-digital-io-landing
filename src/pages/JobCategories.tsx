import React from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

const JobCategories = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSupabaseAuth();

  const handleCategorySelect = (category: string) => {
    // Redirect to talent registration with category preference
    navigate('/register-talent', { state: { category } });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-foreground mb-12 text-center">
          ¿Qué tipo de trabajo buscas?
        </h1>
        
        {/* Featured Categories Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div 
            className="bg-secondary p-12 rounded-lg cursor-pointer hover:bg-card-hover transition-colors hover-scale animate-fade-in"
            onClick={() => handleCategorySelect('Closer de ventas')}
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Closer de ventas
              </h2>
            </div>
          </div>

          <div 
            className="bg-secondary p-12 rounded-lg cursor-pointer hover:bg-card-hover transition-colors hover-scale animate-fade-in"
            onClick={() => handleCategorySelect('Appointment Setter')}
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Appointment Setter
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="bg-secondary p-8 sm:p-12 rounded-lg cursor-pointer hover:bg-card-hover transition-colors hover-scale animate-fade-in"
              onClick={() => handleCategorySelect('Closer de ventas')}
            >
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                  Closer de ventas
                </h2>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobCategories;
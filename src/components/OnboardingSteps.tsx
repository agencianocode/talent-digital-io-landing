import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Play } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  estimatedTime: string;
  action: () => void;
}

interface OnboardingStepsProps {
  steps: OnboardingStep[];
  currentStep: number;
}

export const OnboardingSteps: React.FC<OnboardingStepsProps> = ({ steps, currentStep }) => {
  const getStepStatus = (index: number) => {
    if (steps[index].completed) return 'completed';
    if (index === currentStep) return 'current';
    if (index < currentStep) return 'completed';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'current': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isActive = index === currentStep;
        
        return (
          <Card 
            key={step.id} 
            className={`transition-all duration-300 ${
              isActive ? 'ring-2 ring-primary shadow-lg' : ''
            } ${status === 'completed' ? 'bg-success/5 border-success/20' : ''}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(status)}`}>
                  {status === 'completed' ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    step.icon
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{step.title}</h3>
                    {step.completed && (
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        Completado
                      </Badge>
                    )}
                    {isActive && (
                      <Badge className="bg-primary/10 text-primary">
                        Actual
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {step.estimatedTime}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                <div className="flex gap-2">
                  {isActive && !step.completed && (
                    <Button onClick={step.action} className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Comenzar
                    </Button>
                  )}
                  
                  {step.completed && (
                    <Button variant="outline" onClick={step.action}>
                      Revisar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
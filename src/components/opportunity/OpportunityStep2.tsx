import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface OpportunityStep2Data {
  projectType: 'ongoing' | 'one-time';
  paymentMethod: 'hourly' | 'weekly' | 'monthly';
  hourlyMinRate: string;
  hourlyMaxRate: string;
  weeklyMinBudget: string;
  weeklyMaxBudget: string;
  monthlyMinBudget: string;
  monthlyMaxBudget: string;
  maxHoursPerWeek: number;
  maxHoursPerMonth: number;
  isMaxHoursOptional: boolean;
}

interface OpportunityStep2Props {
  data: OpportunityStep2Data;
  onChange: (data: Partial<OpportunityStep2Data>) => void;
}

const OpportunityStep2 = ({ data, onChange }: OpportunityStep2Props) => {
  const renderPaymentFields = () => {
    switch (data.paymentMethod) {
      case 'hourly':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Tarifa mínima por hora
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="75"
                    value={data.hourlyMinRate}
                    onChange={(e) => onChange({ hourlyMinRate: e.target.value })}
                    className="pl-8 h-12"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">/ hora</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Tarifa máxima por hora
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="125"
                    value={data.hourlyMaxRate}
                    onChange={(e) => onChange({ hourlyMaxRate: e.target.value })}
                    className="pl-8 h-12"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">/ hora</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Máximo de horas por semana
              </Label>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange({ maxHoursPerWeek: Math.max(0, data.maxHoursPerWeek - 1) })}
                  disabled={data.maxHoursPerWeek <= 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={data.maxHoursPerWeek}
                  onChange={(e) => onChange({ maxHoursPerWeek: parseInt(e.target.value) || 0 })}
                  className="w-20 text-center h-10"
                  min="0"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange({ maxHoursPerWeek: data.maxHoursPerWeek + 1 })}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        );

      case 'weekly':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Presupuesto semanal mínimo
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={data.weeklyMinBudget}
                    onChange={(e) => onChange({ weeklyMinBudget: e.target.value })}
                    className="pl-8 h-12"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">/ semana</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Presupuesto semanal máximo
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="4000"
                    value={data.weeklyMaxBudget}
                    onChange={(e) => onChange({ weeklyMaxBudget: e.target.value })}
                    className="pl-8 h-12"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">/ semana</span>
                </div>
              </div>
            </div>
          </>
        );

      case 'monthly':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Presupuesto mensual mínimo
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="4000"
                    value={data.monthlyMinBudget}
                    onChange={(e) => onChange({ monthlyMinBudget: e.target.value })}
                    className="pl-8 h-12"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">/ mes</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Presupuesto mensual máximo
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="8000"
                    value={data.monthlyMaxBudget}
                    onChange={(e) => onChange({ monthlyMaxBudget: e.target.value })}
                    className="pl-8 h-12"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">/ mes</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Máximo de horas por mes
              </Label>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange({ maxHoursPerMonth: Math.max(0, data.maxHoursPerMonth - 1) })}
                  disabled={data.maxHoursPerMonth <= 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={data.maxHoursPerMonth}
                  onChange={(e) => onChange({ maxHoursPerMonth: parseInt(e.target.value) || 0 })}
                  className="w-20 text-center h-10"
                  min="0"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange({ maxHoursPerMonth: data.maxHoursPerMonth + 1 })}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-500">Opcional</span>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          ¿Qué tipo de proyecto necesitas?
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={data.projectType === 'ongoing' ? 'default' : 'outline'}
            onClick={() => onChange({ projectType: 'ongoing' })}
            className="h-14 text-base"
          >
            En curso
          </Button>
          <Button
            type="button"
            variant={data.projectType === 'one-time' ? 'default' : 'outline'}
            onClick={() => onChange({ projectType: 'one-time' })}
            className="h-14 text-base"
          >
            Una sola vez
          </Button>
        </div>
      </div>

      {/* Payment Method for Ongoing Projects */}
      {data.projectType === 'ongoing' && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">
            ¿Cómo deseas pagar este trabajo continuo?
          </Label>
          <div className="grid grid-cols-3 gap-3">
            <Button
              type="button"
              variant={data.paymentMethod === 'hourly' ? 'default' : 'outline'}
              onClick={() => onChange({ paymentMethod: 'hourly' })}
              className="h-12 text-sm"
            >
              Cada hora
            </Button>
            <Button
              type="button"
              variant={data.paymentMethod === 'weekly' ? 'default' : 'outline'}
              onClick={() => onChange({ paymentMethod: 'weekly' })}
              className="h-12 text-sm"
            >
              Semanalmente
            </Button>
            <Button
              type="button"
              variant={data.paymentMethod === 'monthly' ? 'default' : 'outline'}
              onClick={() => onChange({ paymentMethod: 'monthly' })}
              className="h-12 text-sm"
            >
              Mensual
            </Button>
          </div>
        </div>
      )}

      {/* One-time Project Budget */}
      {data.projectType === 'one-time' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Presupuesto mínimo
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                placeholder="2500"
                value={data.monthlyMinBudget}
                onChange={(e) => onChange({ monthlyMinBudget: e.target.value })}
                className="pl-8 h-12"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Presupuesto máximo
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                placeholder="5000"
                value={data.monthlyMaxBudget}
                onChange={(e) => onChange({ monthlyMaxBudget: e.target.value })}
                className="pl-8 h-12"
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Fields based on selection */}
      {data.projectType === 'ongoing' && data.paymentMethod && (
        <div className="space-y-4">
          {renderPaymentFields()}
        </div>
      )}
    </div>
  );
};

export default OpportunityStep2;
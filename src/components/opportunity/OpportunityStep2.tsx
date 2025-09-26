import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus } from 'lucide-react';
import { 
  salaryPeriods,
  durationUnits
} from '@/lib/opportunityTemplates';

interface OpportunityStep2Data {
  projectType: 'ongoing' | 'one-time';
  durationType: 'indefinite' | 'fixed';
  durationValue: number;
  durationUnit: 'days' | 'weeks' | 'months';
  paymentType: 'fixed' | 'commission' | 'fixed_plus_commission';
  paymentMethod: 'hourly' | 'weekly' | 'monthly';
  hourlyMinRate: string;
  hourlyMaxRate: string;
  weeklyMinBudget: string;
  weeklyMaxBudget: string;
  monthlyMinBudget: string;
  monthlyMaxBudget: string;
  commissionPercentage: string;
  salaryIsPublic: boolean;
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
      {/* Duration Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Duración del vínculo
        </Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="indefinite"
              checked={data.durationType === 'indefinite'}
              onCheckedChange={(checked) => {
                if (checked) onChange({ durationType: 'indefinite' });
              }}
            />
            <Label htmlFor="indefinite" className="text-sm">Indefinido</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fixed"
              checked={data.durationType === 'fixed'}
              onCheckedChange={(checked) => {
                if (checked) onChange({ durationType: 'fixed' });
              }}
            />
            <Label htmlFor="fixed" className="text-sm">Duración específica</Label>
          </div>
          {data.durationType === 'fixed' && (
            <div className="flex gap-2 ml-6">
              <Input
                type="number"
                value={data.durationValue}
                onChange={(e) => onChange({ durationValue: parseInt(e.target.value) || 1 })}
                placeholder="Cantidad"
                className="w-24"
              />
              <Select value={data.durationUnit} onValueChange={(value: 'days' | 'weeks' | 'months') => onChange({ durationUnit: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Payment Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Tipo de pago
        </Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fixed_payment"
              checked={data.paymentType === 'fixed'}
              onCheckedChange={(checked) => {
                if (checked) onChange({ paymentType: 'fixed' });
              }}
            />
            <Label htmlFor="fixed_payment" className="text-sm">Fijo</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="commission_payment"
              checked={data.paymentType === 'commission'}
              onCheckedChange={(checked) => {
                if (checked) onChange({ paymentType: 'commission' });
              }}
            />
            <Label htmlFor="commission_payment" className="text-sm">Comisión</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mixed_payment"
              checked={data.paymentType === 'fixed_plus_commission'}
              onCheckedChange={(checked) => {
                if (checked) onChange({ paymentType: 'fixed_plus_commission' });
              }}
            />
            <Label htmlFor="mixed_payment" className="text-sm">Fijo + Comisión</Label>
          </div>
        </div>
      </div>

      {/* Salary Period for Fixed Payments */}
      {(data.paymentType === 'fixed' || data.paymentType === 'fixed_plus_commission') && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Período de pago *
          </Label>
          <Select value={data.paymentMethod} onValueChange={(value: 'hourly' | 'weekly' | 'monthly') => onChange({ paymentMethod: value })}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecciona período" />
            </SelectTrigger>
            <SelectContent>
              {salaryPeriods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Commission Percentage */}
      {(data.paymentType === 'commission' || data.paymentType === 'fixed_plus_commission') && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Porcentaje de comisión (%)
          </Label>
          <Input
            type="number"
            value={data.commissionPercentage}
            onChange={(e) => onChange({ commissionPercentage: e.target.value })}
            placeholder="10"
            max="100"
            className="h-12"
          />
        </div>
      )}

      {/* Salary Visibility */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="salary_public"
          checked={data.salaryIsPublic}
          onCheckedChange={(checked) => onChange({ salaryIsPublic: !!checked })}
        />
        <Label htmlFor="salary_public" className="text-sm">
          Mostrar información de salario públicamente
        </Label>
      </div>

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
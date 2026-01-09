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
  durationType: 'indefinite' | 'fixed';
  durationValue: number;
  durationUnit: 'days' | 'weeks' | 'months';
  paymentType: 'fixed' | 'commission' | 'fixed_plus_commission';
  paymentMethod: 'hourly' | 'weekly' | 'biweekly' | 'monthly' | 'one-time';
  
  // Budget fields
  showBudgetRange: boolean;
  budget: string;
  hourlyMinRate: string;
  hourlyMaxRate: string;
  weeklyMinBudget: string;
  weeklyMaxBudget: string;
  biweeklyMinBudget: string;
  biweeklyMaxBudget: string;
  monthlyMinBudget: string;
  monthlyMaxBudget: string;
  
  // Commission fields
  showCommissionRange: boolean;
  commissionPercentage: string;
  commissionMin: string;
  commissionMax: string;
  
  salaryIsPublic: boolean;
  maxHoursPerWeek: number;
  maxHoursPerMonth: number;
}

interface OpportunityStep2Props {
  data: OpportunityStep2Data;
  onChange: (data: Partial<OpportunityStep2Data>) => void;
}

const OpportunityStep2 = ({ data, onChange }: OpportunityStep2Props) => {
  
  const getBudgetLabel = () => {
    switch (data.paymentMethod) {
      case 'hourly': return data.showBudgetRange ? 'Tarifa por hora' : 'Tarifa por hora';
      case 'weekly': return data.showBudgetRange ? 'Presupuesto semanal' : 'Presupuesto semanal';
      case 'biweekly': return data.showBudgetRange ? 'Presupuesto quincenal' : 'Presupuesto quincenal';
      case 'monthly': return data.showBudgetRange ? 'Presupuesto mensual' : 'Presupuesto mensual';
      case 'one-time': return data.showBudgetRange ? 'Presupuesto' : 'Presupuesto';
      default: return 'Presupuesto';
    }
  };

  const getBudgetSuffix = () => {
    switch (data.paymentMethod) {
      case 'hourly': return '/ hora';
      case 'weekly': return '/ semana';
      case 'biweekly': return '/ quincena';
      case 'monthly': return '/ mes';
      case 'one-time': return '';
      default: return '';
    }
  };

  const renderBudgetFields = () => {
    if (data.paymentType === 'commission') return null;

    const label = getBudgetLabel();
    const suffix = getBudgetSuffix();

    if (!data.showBudgetRange) {
      // Single budget field
      let value = '';
      let onChangeHandler = (_val: string) => {};

      switch (data.paymentMethod) {
        case 'hourly':
          value = data.hourlyMinRate;
          onChangeHandler = (val) => onChange({ hourlyMinRate: val });
          break;
        case 'weekly':
          value = data.weeklyMinBudget;
          onChangeHandler = (val) => onChange({ weeklyMinBudget: val });
          break;
        case 'biweekly':
          value = data.biweeklyMinBudget;
          onChangeHandler = (val) => onChange({ biweeklyMinBudget: val });
          break;
        case 'monthly':
          value = data.monthlyMinBudget;
          onChangeHandler = (val) => onChange({ monthlyMinBudget: val });
          break;
        case 'one-time':
          value = data.budget;
          onChangeHandler = (val) => onChange({ budget: val });
          break;
      }

      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            {label}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              type="number"
              placeholder="5000"
              value={value}
              onChange={(e) => onChangeHandler(e.target.value)}
              className="pl-8 h-12"
            />
            {suffix && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {suffix}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="budget_range"
              checked={data.showBudgetRange}
              onCheckedChange={(checked) => onChange({ showBudgetRange: !!checked })}
            />
            <Label htmlFor="budget_range" className="text-sm text-gray-600 font-normal">
              Especificar rango de presupuesto
            </Label>
          </div>
        </div>
      );
    } else {
      // Range fields (min and max)
      let minValue = '';
      let maxValue = '';
      let onChangeMin = (_val: string) => {};
      let onChangeMax = (_val: string) => {};

      switch (data.paymentMethod) {
        case 'hourly':
          minValue = data.hourlyMinRate;
          maxValue = data.hourlyMaxRate;
          onChangeMin = (val) => onChange({ hourlyMinRate: val });
          onChangeMax = (val) => onChange({ hourlyMaxRate: val });
          break;
        case 'weekly':
          minValue = data.weeklyMinBudget;
          maxValue = data.weeklyMaxBudget;
          onChangeMin = (val) => onChange({ weeklyMinBudget: val });
          onChangeMax = (val) => onChange({ weeklyMaxBudget: val });
          break;
        case 'biweekly':
          minValue = data.biweeklyMinBudget;
          maxValue = data.biweeklyMaxBudget;
          onChangeMin = (val) => onChange({ biweeklyMinBudget: val });
          onChangeMax = (val) => onChange({ biweeklyMaxBudget: val });
          break;
        case 'monthly':
          minValue = data.monthlyMinBudget;
          maxValue = data.monthlyMaxBudget;
          onChangeMin = (val) => onChange({ monthlyMinBudget: val });
          onChangeMax = (val) => onChange({ monthlyMaxBudget: val });
          break;
        case 'one-time':
          minValue = data.budget;
          maxValue = data.monthlyMaxBudget; // Reutilizamos este campo
          onChangeMin = (val) => onChange({ budget: val });
          onChangeMax = (val) => onChange({ monthlyMaxBudget: val });
          break;
      }

      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            {label}
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Mínimo</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  placeholder="3000"
                  value={minValue}
                  onChange={(e) => onChangeMin(e.target.value)}
                  className="pl-8 h-12"
                />
                {suffix && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                    {suffix}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Máximo</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  placeholder="8000"
                  value={maxValue}
                  onChange={(e) => onChangeMax(e.target.value)}
                  className="pl-8 h-12"
                />
                {suffix && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                    {suffix}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="budget_range"
              checked={data.showBudgetRange}
              onCheckedChange={(checked) => onChange({ showBudgetRange: !!checked })}
            />
            <Label htmlFor="budget_range" className="text-sm text-gray-600 font-normal">
              Especificar rango de presupuesto
            </Label>
          </div>
        </div>
      );
    }
  };

  const renderCommissionFields = () => {
    if (data.paymentType !== 'commission' && data.paymentType !== 'fixed_plus_commission') {
      return null;
    }

    if (!data.showCommissionRange) {
      // Single commission field
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Porcentaje de comisión
          </Label>
          <div className="relative">
            <Input
              type="number"
              value={data.commissionPercentage}
              onChange={(e) => onChange({ commissionPercentage: e.target.value })}
              placeholder="10"
              max="100"
              className="h-12 pr-12"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="commission_range"
              checked={data.showCommissionRange}
              onCheckedChange={(checked) => onChange({ showCommissionRange: !!checked })}
            />
            <Label htmlFor="commission_range" className="text-sm text-gray-600 font-normal">
              Especificar rango de comisión
            </Label>
          </div>
        </div>
      );
    } else {
      // Range fields for commission
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Porcentaje de comisión
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Mínima</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="5"
                  value={data.commissionMin}
                  onChange={(e) => onChange({ commissionMin: e.target.value })}
                  max="100"
                  className="h-12 pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Máxima</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="15"
                  value={data.commissionMax}
                  onChange={(e) => onChange({ commissionMax: e.target.value })}
                  max="100"
                  className="h-12 pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="commission_range"
              checked={data.showCommissionRange}
              onCheckedChange={(checked) => onChange({ showCommissionRange: !!checked })}
            />
            <Label htmlFor="commission_range" className="text-sm text-gray-600 font-normal">
              Especificar rango de comisión
            </Label>
          </div>
        </div>
      );
    }
  };

  const renderMaxHoursField = () => {
    if (data.paymentMethod === 'hourly') {
      return (
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
      );
    }

    // Campo "Máximo de horas por mes" removido según solicitud del usuario
    return null;
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

      {/* Payment Period - Always show when not commission-only */}
      {data.paymentType !== 'commission' && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Período de pago *
          </Label>
          <Select 
            value={data.paymentMethod} 
            onValueChange={(value: 'hourly' | 'weekly' | 'monthly' | 'one-time') => onChange({ paymentMethod: value })}
          >
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

      {/* Budget Fields */}
      {renderBudgetFields()}

      {/* Max Hours Field */}
      {renderMaxHoursField()}

      {/* Commission Fields */}
      {renderCommissionFields()}

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
    </div>
  );
};

export default OpportunityStep2;

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';

interface OpportunityStep3Data {
  roleType: string;
  minimumOTE: string;
  maximumOTE: string;
  timezone: string;
  workingHoursTBD: boolean;
  startTime: string;
  endTime: string;
  requirements: string[];
  applicationInstructions: string;
}

interface OpportunityStep3Props {
  data: OpportunityStep3Data;
  onChange: (data: Partial<OpportunityStep3Data>) => void;
}

const roleTypes = [
  'Direct Message Setter',
  'Sales Representative',
  'Customer Success Manager',
  'Marketing Specialist',
  'Content Creator',
  'Virtual Assistant',
  'Project Manager',
  'Graphic Designer',
  'Developer',
  'Consultant'
];

const timezones = [
  'UTC-12:00 (Pacific/Auckland)',
  'UTC-11:00 (Pacific/Midway)',
  'UTC-10:00 (Pacific/Honolulu)',
  'UTC-09:00 (America/Anchorage)',
  'UTC-08:00 (America/Los_Angeles)',
  'UTC-07:00 (America/Denver)',
  'UTC-06:00 (America/Chicago)',
  'UTC-05:00 (America/New_York)',
  'UTC-04:00 (America/Santiago)',
  'UTC-03:00 (America/Sao_Paulo)',
  'UTC-02:00 (Atlantic/South_Georgia)',
  'UTC-01:00 (Atlantic/Azores)',
  'UTC+00:00 (Europe/London)',
  'UTC+01:00 (Europe/Berlin)',
  'UTC+02:00 (Europe/Athens)',
  'UTC+03:00 (Europe/Moscow)',
  'UTC+04:00 (Asia/Dubai)',
  'UTC+05:00 (Asia/Karachi)',
  'UTC+06:00 (Asia/Dhaka)',
  'UTC+07:00 (Asia/Bangkok)',
  'UTC+08:00 (Asia/Singapore)',
  'UTC+09:00 (Asia/Tokyo)',
  'UTC+10:00 (Australia/Sydney)',
  'UTC+11:00 (Pacific/Norfolk)',
  'UTC+12:00 (Pacific/Fiji)'
];

const OpportunityStep3 = ({ data, onChange }: OpportunityStep3Props) => {
  const [newRequirement, setNewRequirement] = useState('');

  const addRequirement = () => {
    if (newRequirement.trim()) {
      onChange({
        requirements: [...data.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    onChange({
      requirements: data.requirements.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Role Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          Role Type <span className="text-red-500">*</span>
        </Label>
        <Select value={data.roleType} onValueChange={(value) => onChange({ roleType: value })}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select role type" />
          </SelectTrigger>
          <SelectContent>
            {roleTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Salary Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Minimum OTE (Annual) <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              type="number"
              placeholder="0"
              value={data.minimumOTE}
              onChange={(e) => onChange({ minimumOTE: e.target.value })}
              className="h-12 pl-8"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Maximum OTE (Annual) <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              type="number"
              placeholder="0"
              value={data.maximumOTE}
              onChange={(e) => onChange({ maximumOTE: e.target.value })}
              className="h-12 pl-8"
            />
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Enter annual salary amounts. You can enter abbreviated values (e.g., 84 for $84,000) or full values (e.g., 84000).
      </p>

      {/* Timezone */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          Timezone <span className="text-red-500">*</span>
        </Label>
        <Select value={data.timezone} onValueChange={(value) => onChange({ timezone: value })}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Choose the primary timezone for this position
        </p>
      </div>

      {/* Working Hours */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="workingHoursTBD"
            checked={data.workingHoursTBD}
            onCheckedChange={(checked) => onChange({ workingHoursTBD: !!checked })}
          />
          <Label htmlFor="workingHoursTBD" className="text-sm font-medium text-gray-900">
            Working Hours To Be Determined
          </Label>
        </div>
        <p className="text-sm text-gray-500">
          Toggle this if working hours will be determined later
        </p>

        {!data.workingHoursTBD && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Start Time <span className="text-red-500">*</span>
              </Label>
              <Input
                type="time"
                value={data.startTime}
                onChange={(e) => onChange({ startTime: e.target.value })}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                End Time <span className="text-red-500">*</span>
              </Label>
              <Input
                type="time"
                value={data.endTime}
                onChange={(e) => onChange({ endTime: e.target.value })}
                className="h-12"
              />
            </div>
          </div>
        )}
      </div>

      {/* Requirements */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-900">
            Requirements <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mt-1">
            Add key requirements for the role (e.g., "Must be fluent in English," "Must have 2+ years of experience")
          </p>
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="Add a requirement (press Enter or click +)"
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
            className="flex-1"
          />
          <Button 
            type="button"
            onClick={addRequirement}
            className="bg-blue-600 hover:bg-blue-700 px-4"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {data.requirements.map((req, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>{req}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRequirement(index)}
                className="text-gray-500 hover:text-red-600"
              >
                Remove
              </Button>
            </div>
          ))}
          {data.requirements.length === 0 && (
            <p className="text-sm text-gray-400 italic">No requirements added yet.</p>
          )}
        </div>
      </div>

      {/* Application Instructions */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          Application Instructions <span className="text-red-500">*</span>
        </Label>
        <Textarea
          placeholder="Provide application instructions (e.g., interview scheduler, phone number, specific website)"
          value={data.applicationInstructions}
          onChange={(e) => onChange({ applicationInstructions: e.target.value })}
          className="min-h-[100px] resize-none"
        />
        <p className="text-sm text-gray-500">
          Share how applicants should apply (interview link, phone number, website, etc.). Note: Our platform has 
          a built-in messaging system where applicants will also be able to message you directly after applying.
        </p>
      </div>
    </div>
  );
};

export default OpportunityStep3;

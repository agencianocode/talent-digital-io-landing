import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface OpportunityStep1Data {
  title: string;
  companyName: string;
  companyDescription: string;
}

interface OpportunityStep1Props {
  data: OpportunityStep1Data;
  onChange: (data: Partial<OpportunityStep1Data>) => void;
}

const OpportunityStep1 = ({ data, onChange }: OpportunityStep1Props) => {
  return (
    <div className="space-y-6">
      {/* Position Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-gray-900">
          Position Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., DM Setter for SaaS Company"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="h-12"
        />
        <p className="text-sm text-gray-500">
          Enter the title of the position you're hiring for
        </p>
      </div>

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-sm font-medium text-gray-900">
          Company Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="companyName"
          placeholder="Your company name"
          value={data.companyName}
          onChange={(e) => onChange({ companyName: e.target.value })}
          className="h-12"
        />
      </div>

      {/* Company Description */}
      <div className="space-y-2">
        <Label htmlFor="companyDescription" className="text-sm font-medium text-gray-900">
          Company Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="companyDescription"
          placeholder="Brief description of your company"
          value={data.companyDescription}
          onChange={(e) => onChange({ companyDescription: e.target.value })}
          className="min-h-[120px] resize-none"
        />
      </div>
    </div>
  );
};

export default OpportunityStep1;

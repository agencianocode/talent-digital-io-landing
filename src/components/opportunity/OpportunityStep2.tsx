import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PricePoint {
  id: string;
  programName: string;
  price: string;
}

interface SocialLink {
  id: string;
  url: string;
}

interface OpportunityStep2Data {
  pricePoints: PricePoint[];
  socialLinks: SocialLink[];
}

interface OpportunityStep2Props {
  data: OpportunityStep2Data;
  onChange: (data: Partial<OpportunityStep2Data>) => void;
}

const OpportunityStep2 = ({ data, onChange }: OpportunityStep2Props) => {
  const [newPricePoint, setNewPricePoint] = useState({ programName: '', price: '' });
  const [newSocialLink, setNewSocialLink] = useState('');

  const addPricePoint = () => {
    if (newPricePoint.programName && newPricePoint.price) {
      const newPoint: PricePoint = {
        id: Date.now().toString(),
        programName: newPricePoint.programName,
        price: newPricePoint.price
      };
      onChange({
        pricePoints: [...data.pricePoints, newPoint]
      });
      setNewPricePoint({ programName: '', price: '' });
    }
  };

  const removePricePoint = (id: string) => {
    onChange({
      pricePoints: data.pricePoints.filter(point => point.id !== id)
    });
  };

  const addSocialLink = () => {
    if (newSocialLink.trim()) {
      const newLink: SocialLink = {
        id: Date.now().toString(),
        url: newSocialLink.trim()
      };
      onChange({
        socialLinks: [...data.socialLinks, newLink]
      });
      setNewSocialLink('');
    }
  };

  const removeSocialLink = (id: string) => {
    onChange({
      socialLinks: data.socialLinks.filter(link => link.id !== id)
    });
  };

  return (
    <div className="space-y-8">
      {/* Price Points */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-900">
            Price Points <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mt-1">
            Add pricing details for each program or service you offer
          </p>
        </div>

        {/* Add New Price Point */}
        <div className="flex gap-3">
          <Input
            placeholder="Program Name"
            value={newPricePoint.programName}
            onChange={(e) => setNewPricePoint(prev => ({ ...prev, programName: e.target.value }))}
            className="flex-1"
          />
          <Input
            placeholder="Price"
            value={newPricePoint.price}
            onChange={(e) => setNewPricePoint(prev => ({ ...prev, price: e.target.value }))}
            className="w-32"
          />
          <Button 
            type="button"
            onClick={addPricePoint}
            className="bg-blue-600 hover:bg-blue-700 px-4"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm text-gray-500">
          Click the + button after entering each price point to save it
        </p>

        {/* Price Points List */}
        <div className="space-y-2">
          {data.pricePoints.map((point) => (
            <div key={point.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">
                {point.programName} - {point.price}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePricePoint(point.id)}
                className="text-gray-500 hover:text-red-600"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Company Online Presence */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-900">
            Company Online Presence <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mt-1">
            Add a link to your website or most active social media profile (e.g., Instagram, YouTube, LinkedIn)
          </p>
        </div>

        {/* Add New Social Link */}
        <div className="flex gap-3">
          <Input
            placeholder="Enter your website or social media URL (e.g., https://instagram.com/yourcompany)"
            value={newSocialLink}
            onChange={(e) => setNewSocialLink(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="button"
            onClick={addSocialLink}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add
          </Button>
        </div>

        {/* Social Links List */}
        <div className="space-y-2">
          {data.socialLinks.map((link) => (
            <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium truncate">{link.url}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSocialLink(link.id)}
                className="text-gray-500 hover:text-red-600"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpportunityStep2;

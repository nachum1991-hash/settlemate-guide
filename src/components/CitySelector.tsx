import { useCity, cities, City } from '@/contexts/CityContext';
import { MapPin, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CitySelector = () => {
  const { selectedCity, setSelectedCity, cityInfo } = useCity();

  return (
    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
      <div className="p-2 bg-primary/10 rounded-lg">
        <MapPin className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-1">Your destination city</p>
        <Select value={selectedCity} onValueChange={(value: City) => setSelectedCity(value)}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background border-primary/20 h-11">
            <SelectValue>
              <span className="flex items-center gap-2">
                <span>{cityInfo.emoji}</span>
                <span className="font-medium">{cityInfo.name}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border-primary/20">
            {cities.map((city) => (
              <SelectItem 
                key={city.id} 
                value={city.id}
                className="cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>{city.emoji}</span>
                  <span>{city.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CitySelector;

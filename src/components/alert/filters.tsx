import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
// import { AlertFilter } from '@/types/alert';
// import { filterOptions } from '@/data/mockAlerts';
import { Search } from 'lucide-react';
import { AlertFilter } from '@/lib/alerts-data';
import { filterOptions } from '@/data/mockAlerts';

interface FiltersProps {
  filters: AlertFilter;
  onFilterChange: (key: keyof AlertFilter, value: string) => void;
}

export function Filters({ filters, onFilterChange }: FiltersProps) {
  return (
    <div className="flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:space-x-2 mb-4 w-full">
      <div className="flex flex-1 items-center space-x-2">
        <Select
          value={filters.lastUpdated}
          onValueChange={(value) => onFilterChange('lastUpdated', value)}
        >
          <SelectTrigger className="w-full lg:w-[200px]">
            <span className="text-muted-foreground mr-2">Last updated:</span>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.lastUpdated.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.created}
          onValueChange={(value) => onFilterChange('created', value)}
        >
          <SelectTrigger className="w-full lg:w-[200px]">
            <span className="text-muted-foreground mr-2">Created:</span>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.created.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.alerts}
          onValueChange={(value) => onFilterChange('alerts', value)}
        >
          <SelectTrigger className="w-full lg:w-[200px]">
            <span className="text-muted-foreground mr-2">Alerts:</span>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.alerts.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.caseStatus}
          onValueChange={(value) => onFilterChange('caseStatus', value)}
        >
          <SelectTrigger className="w-full lg:w-[200px]">
            <span className="text-muted-foreground mr-2">Case status:</span>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.caseStatus.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.dataSource}
          onValueChange={(value) => onFilterChange('dataSource', value)}
        >
          <SelectTrigger className="w-full lg:w-[200px]">
            <span className="text-muted-foreground mr-2">Data source / processor:</span>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.dataSource.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative w-full lg:w-auto flex-1 lg:flex-none">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="pl-10 w-full lg:w-[300px]"
          placeholder="Search"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange('searchQuery', e.target.value)}
        />
      </div>
    </div>
  );
}
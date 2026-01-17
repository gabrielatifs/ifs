import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import LocationSearchInput from '@/components/ui/LocationSearchInput';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function JobFilters({ filters, onFilterChange, onClearFilters }) {
    const salaryRange = filters.salaryRange || [0, 200000];
    const hasActiveFilters = filters.search || filters.locationName || filters.radius !== '0' || 
                             filters.experienceLevel !== 'All' || filters.workPattern !== 'All' ||
                             salaryRange[0] > 0 || salaryRange[1] < 200000;

    const handleSalaryChange = (value) => {
        onFilterChange('salaryRange', value);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
                <Filter className="w-4 h-4" />
                <h3>Search Jobs</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Keyword Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search..."
                        className="pl-10 bg-white"
                        value={filters.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                    />
                </div>

                {/* Location Search */}
                <LocationSearchInput 
                    value={filters.locationName} 
                    onChange={(value) => onFilterChange('location', value)} 
                    placeholder="Location..."
                />

                {/* Radius Filter */}
                <div>
                    <Select 
                        value={filters.radius} 
                        onValueChange={(value) => onFilterChange('radius', value)}
                        disabled={!filters.coordinates}
                    >
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Radius" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Exact Location</SelectItem>
                            <SelectItem value="10">Within 10 miles</SelectItem>
                            <SelectItem value="25">Within 25 miles</SelectItem>
                            <SelectItem value="50">Within 50 miles</SelectItem>
                            <SelectItem value="100">Within 100 miles</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Seniority / Experience Level */}
                <Select 
                    value={filters.experienceLevel} 
                    onValueChange={(value) => onFilterChange('experienceLevel', value)}
                >
                    <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seniority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">Any Seniority</SelectItem>
                        <SelectItem value="Entry-level">Entry-level</SelectItem>
                        <SelectItem value="Mid-level">Mid-level</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Leadership">Leadership</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                    </SelectContent>
                </Select>

                {/* Work Pattern (Working Hours) */}
                <Select 
                    value={filters.workPattern} 
                    onValueChange={(value) => onFilterChange('workPattern', value)}
                >
                    <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Work Pattern" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">Any Pattern</SelectItem>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Job share">Job share</SelectItem>
                        <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                </Select>

                {/* Salary Range Slider */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between bg-white font-normal">
                            <span className="truncate">
                                {salaryRange[0] === 0 && salaryRange[1] === 200000 
                                    ? "Salary Range" 
                                    : `£${salaryRange[0].toLocaleString()} - £${salaryRange[1].toLocaleString()}${salaryRange[1] === 200000 ? '+' : ''}`}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Salary Range</h4>
                                <p className="text-sm text-muted-foreground">
                                    Adjust the slider to filter by annual salary.
                                </p>
                            </div>
                            <div className="pt-2">
                                <Slider
                                    defaultValue={[0, 200000]}
                                    value={salaryRange}
                                    max={200000}
                                    step={5000}
                                    minStepsBetweenThumbs={1}
                                    onValueChange={handleSalaryChange}
                                    className="py-4"
                                />
                                <div className="flex items-center justify-between mt-2 text-sm text-slate-600">
                                    <span>£{salaryRange[0].toLocaleString()}</span>
                                    <span>£{salaryRange[1].toLocaleString()}{salaryRange[1] === 200000 ? '+' : ''}</span>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <div className="flex justify-end pt-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={onClearFilters}
                        className="text-slate-500 hover:text-slate-900"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Clear all filters
                    </Button>
                </div>
            )}
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card'; // Added Card and CardContent imports

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

// Added 'user' prop to the component signature
function CourseFilters({ onFilterChange, levels = [], geographies = [], initialFilters, user }) {
    const [level, setLevel] = useState(initialFilters?.level || 'All');
    const [geography, setGeography] = useState(initialFilters?.geography ||'All');
    const [search, setSearch] = useState(initialFilters?.search ||'');

    const debouncedLevel = useDebounce(level, 300);
    const debouncedGeography = useDebounce(geography, 300);
    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        onFilterChange({ 
            level: debouncedLevel, 
            geography: debouncedGeography,
            search: debouncedSearch
        });
    }, [debouncedLevel, debouncedGeography, debouncedSearch, onFilterChange]);

    // This effect ensures that if the parent component wants to reset filters, they update here.
    useEffect(() => {
        if (initialFilters) {
            setLevel(initialFilters.level || 'All');
            setGeography(initialFilters.geography || 'All');
            setSearch(initialFilters.search || '');
        }
    }, [initialFilters]);

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative w-full"> {/* Adjusted class for grid layout */}
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {/* Selects are now direct children of the grid container */}
                    <Select value={level} onValueChange={setLevel} disabled={levels.length === 1}>
                        <SelectTrigger className="w-full md:w-auto"> {/* Adjusted class for grid layout */}
                            <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Levels</SelectItem>
                            {levels.map(l => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={geography} onValueChange={setGeography}>
                        <SelectTrigger className="w-full md:w-auto"> {/* Adjusted class for grid layout */}
                            <SelectValue placeholder="All Geographies" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Geographies</SelectItem>
                            {geographies.sort().map(g => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Discount Notice */}
                {user?.organisationId && user?.hasOrgDiscount && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                            🎉 Your organisation has an active membership - you'll receive 20% off all courses!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default CourseFilters;

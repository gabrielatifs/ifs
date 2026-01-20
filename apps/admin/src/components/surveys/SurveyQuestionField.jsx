import React from 'react';
import { Input } from '@ifs/shared/components/ui/input';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@ifs/shared/components/ui/radio-group';
import { Checkbox } from '@ifs/shared/components/ui/checkbox';
import { AlertCircle, Star } from 'lucide-react';
import { Label } from '@ifs/shared/components/ui/label';

const SurveyQuestionField = ({ question, value, otherValue, commentValue, onChange, onOtherChange, onCommentChange, hasError }) => {
    const handleCheckboxChange = (option, checked) => {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = checked
            ? [...currentValues, option]
            : currentValues.filter(v => v !== option);
        onChange(newValues);
    };

    const renderMainField = () => {
        switch (question.type) {
            case 'text':
                return (
                    <div>
                        <Input
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Your answer"
                            required={question.required}
                            className={`text-sm md:text-base w-full ${hasError ? 'border-red-500 border-2' : ''}`}
                        />
                        {hasError && (
                            <div className="flex items-center gap-2 mt-2 text-red-600">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-xs md:text-sm font-medium">This field is required</span>
                            </div>
                        )}
                    </div>
                );
            
            case 'textarea':
                return (
                    <div>
                        <Textarea
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Your detailed response"
                            rows={4}
                            required={question.required}
                            className={`text-sm md:text-base w-full resize-none ${hasError ? 'border-red-500 border-2' : ''}`}
                        />
                        {hasError && (
                            <div className="flex items-center gap-2 mt-2 text-red-600">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-xs md:text-sm font-medium">This field is required</span>
                            </div>
                        )}
                    </div>
                );
            
            case 'radio':
                return (
                    <div>
                        <RadioGroup value={value || ''} onValueChange={onChange} required={question.required} className="space-y-2">
                            {question.options?.map((option, idx) => (
                                <label
                                    key={idx}
                                    className={`flex items-start gap-3 p-3 md:p-4 rounded-lg border transition-all cursor-pointer ${
                                        value === option
                                            ? 'border-purple-500 bg-purple-50'
                                            : hasError 
                                            ? 'border-red-300 bg-red-50' 
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <RadioGroupItem value={option} id={`${question.id}-${idx}`} className="flex-shrink-0 mt-0.5" />
                                    <span className="flex-1 text-xs md:text-base text-slate-700 break-words leading-relaxed">
                                        {option}
                                    </span>
                                </label>
                            ))}
                            {question.hasOtherOption && (
                                <label
                                    className={`flex items-start gap-3 p-3 md:p-4 rounded-lg border transition-all cursor-pointer ${
                                        value === '__other__'
                                            ? 'border-purple-500 bg-purple-50'
                                            : hasError 
                                            ? 'border-red-300 bg-red-50' 
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <RadioGroupItem value="__other__" id={`${question.id}-other`} className="flex-shrink-0 mt-0.5" />
                                    <span className="flex-1 text-xs md:text-base text-slate-700">
                                        Other (please specify)
                                    </span>
                                </label>
                            )}
                        </RadioGroup>
                        {question.hasOtherOption && value === '__other__' && (
                            <Input
                                value={otherValue || ''}
                                onChange={(e) => onOtherChange(e.target.value)}
                                placeholder="Please specify"
                                className={`mt-3 text-sm md:text-base w-full ${hasError && !otherValue?.trim() ? 'border-red-500 border-2' : ''}`}
                                required
                            />
                        )}
                        {hasError && (
                            <div className="flex items-center gap-2 mt-2 text-red-600">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-xs md:text-sm font-medium">Please select an option</span>
                            </div>
                        )}
                    </div>
                );
            
            case 'checkbox':
                return (
                    <div>
                        <div className="space-y-2">
                            {question.options?.map((option, idx) => (
                                <label
                                    key={idx}
                                    className={`flex items-start gap-3 p-3 md:p-4 rounded-lg border transition-all cursor-pointer ${
                                        Array.isArray(value) && value.includes(option)
                                            ? 'border-purple-500 bg-purple-50'
                                            : hasError 
                                            ? 'border-red-300 bg-red-50' 
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <Checkbox
                                        id={`${question.id}-${idx}`}
                                        checked={Array.isArray(value) && value.includes(option)}
                                        onCheckedChange={(checked) => handleCheckboxChange(option, checked)}
                                        className="flex-shrink-0 mt-0.5"
                                    />
                                    <span className="flex-1 text-xs md:text-base text-slate-700 break-words leading-relaxed">
                                        {option}
                                    </span>
                                </label>
                            ))}
                            {question.hasOtherOption && (
                                <label
                                    className={`flex items-start gap-3 p-3 md:p-4 rounded-lg border transition-all cursor-pointer ${
                                        Array.isArray(value) && value.includes('__other__')
                                            ? 'border-purple-500 bg-purple-50'
                                            : hasError 
                                            ? 'border-red-300 bg-red-50' 
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <Checkbox
                                        id={`${question.id}-other`}
                                        checked={Array.isArray(value) && value.includes('__other__')}
                                        onCheckedChange={(checked) => handleCheckboxChange('__other__', checked)}
                                        className="flex-shrink-0 mt-0.5"
                                    />
                                    <span className="flex-1 text-xs md:text-base text-slate-700">
                                        Other (please specify)
                                    </span>
                                </label>
                            )}
                        </div>
                        {question.hasOtherOption && Array.isArray(value) && value.includes('__other__') && (
                            <Input
                                value={otherValue || ''}
                                onChange={(e) => onOtherChange(e.target.value)}
                                placeholder="Please specify"
                                className={`text-sm md:text-base mt-3 w-full ${hasError && !otherValue?.trim() ? 'border-red-500 border-2' : ''}`}
                                required
                            />
                        )}
                        {hasError && (
                            <div className="flex items-center gap-2 mt-2 text-red-600">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-xs md:text-sm font-medium">Please select at least one option</span>
                            </div>
                        )}
                    </div>
                );
            
            case 'rating':
                return (
                    <div>
                        <div className={`flex gap-2 md:gap-3 justify-center py-4 md:py-6 ${hasError ? 'bg-red-50 rounded-lg border-2 border-red-500 px-2' : ''}`}>
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    onClick={() => onChange(rating)}
                                    className={`p-2 md:p-3 rounded-lg transition-all ${
                                        value >= rating
                                            ? 'scale-110'
                                            : 'hover:scale-105'
                                    }`}
                                >
                                    <Star className={`w-8 h-8 md:w-12 md:h-12 transition-colors ${value >= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-300'}`} />
                                </button>
                            ))}
                        </div>
                        {value && (
                            <p className="text-center text-xs md:text-sm text-slate-600 mt-2">
                                {value} out of 5 stars
                            </p>
                        )}
                        {hasError && (
                            <div className="flex items-center gap-2 mt-2 text-red-600 justify-center">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-xs md:text-sm font-medium">Please select a rating</span>
                            </div>
                        )}
                    </div>
                );
            
            case 'scale':
                const min = question.minValue || 1;
                const max = question.maxValue || 10;
                return (
                    <div className={`space-y-4 py-3 md:py-4 ${hasError ? 'bg-red-50 rounded-lg border-2 border-red-500 px-3 md:px-4' : ''}`}>
                        <div className="flex justify-between text-xs md:text-sm font-medium text-slate-600 mb-2 px-1">
                            <span>{min}</span>
                            <span>{max}</span>
                        </div>
                        <Input
                            type="range"
                            min={min}
                            max={max}
                            value={value || min}
                            onChange={(e) => onChange(parseInt(e.target.value))}
                            className="w-full h-2 accent-purple-600"
                        />
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2 bg-slate-100 rounded-lg border">
                                <span className="text-xl md:text-2xl font-bold text-slate-900">{value || min}</span>
                                <span className="text-xs md:text-sm text-slate-600">/ {max}</span>
                            </div>
                        </div>
                        {hasError && (
                            <div className="flex items-center gap-2 text-red-600 justify-center">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-xs md:text-sm font-medium">Please select a value</span>
                            </div>
                        )}
                    </div>
                );
            
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {renderMainField()}
            
            {question.allowComments && (
                <div className="pt-4 border-t">
                    <Label htmlFor={`comment-${question.id}`} className="text-xs md:text-sm font-medium text-slate-700 mb-2 block">
                        {question.commentLabel || 'Additional comments (optional)'}
                    </Label>
                    <Textarea
                        id={`comment-${question.id}`}
                        value={commentValue || ''}
                        onChange={(e) => onCommentChange(e.target.value)}
                        placeholder="Share any additional thoughts..."
                        rows={3}
                        className="text-sm md:text-base w-full resize-none"
                    />
                </div>
            )}
        </div>
    );
};

export default SurveyQuestionField;
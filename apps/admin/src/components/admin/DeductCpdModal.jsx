import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@ifs/shared/components/ui/dialog';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { Loader2, MinusCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@ifs/shared/components/ui/use-toast';
import { deductCpdHours } from '@ifs/shared/api/functions';

export default function DeductCpdModal({ open, onOpenChange, users, onDeducted }) {
    const { toast } = useToast();
    const [isDeducting, setIsDeducting] = useState(false);
    const [form, setForm] = useState({
        userId: '',
        amount: '',
        reason: ''
    });

    const handleDeduct = async () => {
        if (!form.userId || !form.amount || !form.reason) {
            toast({
                title: "Missing Information",
                description: "Please select a user, enter amount, and provide a reason",
                variant: "destructive"
            });
            return;
        }

        const amount = parseFloat(form.amount);
        if (isNaN(amount) || amount <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid positive number",
                variant: "destructive"
            });
            return;
        }

        setIsDeducting(true);
        try {
            const response = await deductCpdHours({
                userId: form.userId,
                amount: amount,
                reason: form.reason
            });

            if (response.data.success) {
                toast({
                    title: "CPD Hours Deducted",
                    description: `Deducted ${response.data.deducted.toFixed(1)} hour(s) from ${response.data.user.displayName || response.data.user.email}. New balance: ${response.data.newBalance.toFixed(1)} hours`
                });

                setForm({ userId: '', amount: '', reason: '' });
                onOpenChange(false);
                if (onDeducted) onDeducted();
            } else {
                throw new Error(response.data.error || 'Deduction failed');
            }
        } catch (error) {
            console.error('Deduction error:', error);
            toast({
                title: "Deduction Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsDeducting(false);
        }
    };

    const selectedUser = users.find(u => u.id === form.userId);
    const currentBalance = selectedUser?.cpdHours || 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MinusCircle className="w-5 h-5 text-red-600" />
                        Deduct CPD Hours
                    </DialogTitle>
                    <DialogDescription>
                        Remove CPD hours from a member's balance with a reason for record-keeping
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="userId" className="text-sm font-medium mb-2 block">Select Member *</Label>
                        <Select
                            value={form.userId}
                            onValueChange={(value) => setForm({...form, userId: value})}
                        >
                            <SelectTrigger id="userId">
                                <SelectValue placeholder="Choose a member" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {users
                                    .filter(u => u.membershipStatus === 'active' && (u.cpdHours || 0) > 0)
                                    .map(member => (
                                        <SelectItem key={member.id} value={member.id}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{member.displayName || member.full_name} ({member.email})</span>
                                                <span className="ml-2 text-xs text-slate-500">
                                                    {(member.cpdHours || 0).toFixed(1)} hrs
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        {selectedUser && (
                            <p className="text-xs text-slate-500 mt-1">
                                Current balance: <span className="font-semibold text-slate-700">{currentBalance.toFixed(1)} hours</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="amount" className="text-sm font-medium mb-2 block">Hours to Deduct *</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={form.amount}
                            onChange={(e) => setForm({...form, amount: e.target.value})}
                            placeholder="e.g., 2.5"
                        />
                        {form.amount && !isNaN(parseFloat(form.amount)) && parseFloat(form.amount) > 0 && (
                            <p className="text-xs text-slate-500 mt-1">
                                New balance will be: <span className="font-semibold text-red-600">
                                    {Math.max(0, currentBalance - parseFloat(form.amount)).toFixed(1)} hours
                                </span>
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="reason" className="text-sm font-medium mb-2 block">Reason for Deduction *</Label>
                        <Textarea
                            id="reason"
                            value={form.reason}
                            onChange={(e) => setForm({...form, reason: e.target.value})}
                            placeholder="e.g., Correction for duplicate booking, Administrative adjustment, etc."
                            rows={3}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            This will appear in the member's CPD transaction history
                        </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-800 font-medium">Important</p>
                            <p className="text-xs text-red-700 mt-1">
                                This action will deduct CPD hours from the member's balance and create a permanent transaction record. 
                                Make sure to provide a clear reason for audit purposes.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setForm({ userId: '', amount: '', reason: '' });
                            onOpenChange(false);
                        }}
                        disabled={isDeducting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeduct}
                        disabled={isDeducting || !form.userId || !form.amount || !form.reason}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isDeducting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deducting...
                            </>
                        ) : (
                            <>
                                <MinusCircle className="w-4 h-4 mr-2" />
                                Deduct Hours
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
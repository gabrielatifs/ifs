import React, { useState, useRef } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Label } from '@ifs/shared/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@ifs/shared/components/ui/dialog';
import { Edit2, Loader2, Upload, X, Linkedin, Mail } from 'lucide-react';
import { useAdminMode } from '@ifs/shared/components/providers/AdminModeProvider';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { TeamMember } from '@ifs/shared/api/entities';
import { UploadFile } from '@ifs/shared/api/integrations';
import { useToast } from "@ifs/shared/components/ui/use-toast";

export function LeadershipCard({ member, onUpdate }) {
    const { isAdminMode } = useAdminMode();
    const { user } = useUser();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editedMember, setEditedMember] = useState(member);
    const fileInputRef = useRef(null);

    const handleEditClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditedMember(member);
        setIsEditing(true);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const { id, created_date, updated_date, created_by, ...updateData } = editedMember;
            await TeamMember.update(id, updateData);
            onUpdate();
            setIsEditing(false);
            toast({ title: "Success", description: "Team member updated." });
        } catch (error) {
            console.error("Update failed:", error);
            toast({ title: "Error", description: "Failed to update team member.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            setEditedMember(prev => ({ ...prev, image: file_url }));
        } catch (error) {
            toast({ title: "Upload Failed", description: "Could not upload image.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="group grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {isAdminMode && user?.role === 'admin' && (
                <div className="absolute z-10 top-2 right-2">
                     <Button onClick={handleEditClick} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"><Edit2 className="w-4 h-4 mr-1"/>Edit</Button>
                </div>
            )}
            <div className={`relative lg:col-span-2 ${editedMember.displayOrder % 2 === 0 ? 'lg:order-last' : ''}`}>
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-purple-200 transition-all duration-300">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 blur-lg"></div>
            </div>
            <div className="lg:col-span-3">
                <h3 className="text-3xl font-bold text-black mb-2">{member.name}</h3>
                <p className="text-purple-600 font-semibold text-xl mb-6">{member.title}</p>
                <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap">{member.bio}</p>
                <div className="flex items-center gap-4">
                    {member.linkedinUrl && <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="icon" className="rounded-full hover:bg-gray-100"><Linkedin className="w-5 h-5 text-gray-500" /></Button></a>}
                    {member.email && <a href={`mailto:${member.email}`}><Button variant="outline" size="icon" className="rounded-full hover:bg-gray-100"><Mail className="w-5 h-5 text-gray-500" /></Button></a>}
                </div>
            </div>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Edit Team Member</DialogTitle>
                        <DialogDescription>Make changes to the team member's profile. Click save when you're done.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={editedMember.name} onChange={(e) => setEditedMember(prev => ({...prev, name: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={editedMember.title} onChange={(e) => setEditedMember(prev => ({...prev, title: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Biography</Label>
                            <Textarea id="bio" value={editedMember.bio} onChange={(e) => setEditedMember(prev => ({...prev, bio: e.target.value}))} className="min-h-[150px]" />
                        </div>
                        <div className="space-y-2">
                            <Label>Image</Label>
                            {editedMember.image && <img src={editedMember.image} alt="Preview" className="w-32 h-auto rounded-md border p-1" />}
                            <Input placeholder="Image URL" value={editedMember.image || ''} onChange={(e) => setEditedMember(prev => ({...prev, image: e.target.value}))} />
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />} Upload Image
                            </Button>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn URL</Label>
                            <Input id="linkedin" value={editedMember.linkedinUrl || ''} onChange={(e) => setEditedMember(prev => ({...prev, linkedinUrl: e.target.value}))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={editedMember.email || ''} onChange={(e) => setEditedMember(prev => ({...prev, email: e.target.value}))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSave} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export function TrusteeCard({ member, onUpdate }) {
    const { isAdminMode } = useAdminMode();
    const { user } = useUser();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editedMember, setEditedMember] = useState(member);
    const fileInputRef = useRef(null);

    const handleEditClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditedMember(member);
        setIsEditing(true);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const { id, ...updateData } = editedMember;
            await TeamMember.update(id, updateData);
            onUpdate();
            setIsEditing(false);
            toast({ title: "Success", description: "Trustee updated." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update trustee.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            setEditedMember(prev => ({ ...prev, image: file_url }));
        } catch (error) {
            toast({ title: "Upload Failed", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };
    
    return (
        <div className="group text-center relative">
            {isAdminMode && user?.role === 'admin' && (
                <div className="absolute z-10 top-0 right-0">
                     <Button onClick={handleEditClick} size="icon" variant="secondary" className="rounded-full h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"><Edit2 className="w-4 h-4"/></Button>
                </div>
            )}
            <div className="relative w-36 h-36 md:w-40 md:h-40 mx-auto mb-4">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-green-300 transition-all duration-300 scale-105 group-hover:scale-110"></div>
            </div>
            <h3 className="text-lg font-bold text-black mb-1">{member.name}</h3>
            <p className="text-gray-600 font-medium text-sm">{member.title}</p>
            
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Trustee</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={editedMember.name} onChange={(e) => setEditedMember(prev => ({...prev, name: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={editedMember.title} onChange={(e) => setEditedMember(prev => ({...prev, title: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Image</Label>
                            {editedMember.image && <img src={editedMember.image} alt="Preview" className="w-32 h-auto rounded-md border p-1" />}
                            <Input placeholder="Image URL" value={editedMember.image || ''} onChange={(e) => setEditedMember(prev => ({...prev, image: e.target.value}))} />
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />} Upload
                            </Button>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Save'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
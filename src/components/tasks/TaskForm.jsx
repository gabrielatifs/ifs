import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function TaskForm({ task, onSubmit, onCancel }) {
    const [currentTask, setCurrentTask] = React.useState(task || {
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        category: "personal",
        due_date: ""
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(currentTask);
    };

    return (
        <motion.div
            
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    placeholder="What needs to be done?"
                    value={currentTask.title}
                    onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                    className="text-lg"
                />
                <Textarea
                    placeholder="Add details..."
                    value={currentTask.description}
                    onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                    className="h-24"
                />
                <div className="flex gap-4 flex-wrap">
                    <Select
                        value={currentTask.priority}
                        onValueChange={(value) => setCurrentTask({...currentTask, priority: value})}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={currentTask.category}
                        onValueChange={(value) => setCurrentTask({...currentTask, category: value})}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="work">Work</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="shopping">Shopping</SelectItem>
                            <SelectItem value="health">Health</SelectItem>
                            <SelectItem value="learning">Learning</SelectItem>
                        </SelectContent>
                    </Select>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {currentTask.due_date ? format(new Date(currentTask.due_date), 'PPP') : 'Set due date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={currentTask.due_date ? new Date(currentTask.due_date) : undefined}
                                onSelect={(date) => setCurrentTask({...currentTask, due_date: date})}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                        {task ? 'Update Task' : 'Create Task'}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}
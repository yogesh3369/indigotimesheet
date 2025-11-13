import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, CalendarIcon } from 'lucide-react';
import { format, subDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import ProjectIcon from '@/components/ProjectIcon';

interface Project {
  id: string;
  project_name: string;
  icon: string | null;
}

interface TaskRow {
  id: string;
  project_id: string;
  task_name: string;
  date: Date;
  hours: string;
  minutes: string;
  notes: string;
}

const AddTask = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([
    {
      id: Math.random().toString(),
      project_id: '',
      task_name: '',
      date: new Date(),
      hours: '0',
      minutes: '0',
      notes: '',
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('project_name');

    if (!error && data) {
      setProjects(data);
    }
  };

  const addTaskRow = () => {
    if (tasks.length >= 20) {
      toast({
        variant: 'destructive',
        title: 'Limit reached',
        description: 'You can add maximum 20 tasks at once',
      });
      return;
    }

    setTasks([
      ...tasks,
      {
        id: Math.random().toString(),
        project_id: '',
        task_name: '',
        date: new Date(),
        hours: '0',
        minutes: '0',
        notes: '',
      },
    ]);
  };

  const removeTaskRow = (id: string) => {
    if (tasks.length === 1) {
      toast({
        variant: 'destructive',
        title: 'Cannot remove',
        description: 'At least one task is required',
      });
      return;
    }
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const updateTask = (id: string, field: keyof TaskRow, value: any) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, [field]: value } : task
      )
    );
  };

  const validateTasks = () => {
    const today = startOfDay(new Date());
    const sevenDaysAgo = startOfDay(subDays(new Date(), 7));

    for (const task of tasks) {
      if (!task.project_id) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Please select a project for all tasks',
        });
        return false;
      }
      if (!task.task_name.trim()) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Please enter a task name for all tasks',
        });
        return false;
      }
      
      // Date validation: must be within last 7 days (including today)
      const taskDate = startOfDay(task.date);
      if (isAfter(taskDate, today)) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Task date cannot be in the future',
        });
        return false;
      }
      if (isBefore(taskDate, sevenDaysAgo)) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Task date must be within the last 7 days',
        });
        return false;
      }

      const hours = parseInt(task.hours);
      const minutes = parseInt(task.minutes);
      if (isNaN(hours) || hours < 0 || hours > 23) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Hours must be between 0 and 23',
        });
        return false;
      }
      if (isNaN(minutes) || minutes < 0 || minutes > 59) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Minutes must be between 0 and 59',
        });
        return false;
      }
      
      // Total time validation: cannot exceed 24 hours (1440 minutes)
      const totalMinutes = hours * 60 + minutes;
      if (totalMinutes > 1440) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Total time cannot exceed 24 hours',
        });
        return false;
      }
    }
    return true;
  };

  const handleSaveAll = async () => {
    if (!validateTasks()) return;

    setLoading(true);

    const tasksToInsert = tasks.map((task) => ({
      user_id: user?.id,
      project_id: task.project_id,
      task_name: task.task_name,
      date: format(task.date, 'yyyy-MM-dd'),
      hours: parseInt(task.hours),
      minutes: parseInt(task.minutes),
      notes: task.notes || null,
    }));

    const { error } = await supabase.from('tasks').insert(tasksToInsert);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      setLoading(false);
    } else {
      toast({
        title: 'Success',
        description: `${tasks.length} task(s) saved successfully`,
      });
      setLoading(false);
      // Redirect to dashboard after successful submission
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Add Tasks</h2>
        <Button onClick={addTaskRow} variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Another Task
        </Button>
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Task {index + 1}</span>
                {tasks.length > 1 && (
                  <Button
                    onClick={() => removeTaskRow(task.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive-foreground hover:bg-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Project *</Label>
                  <Select
                    value={task.project_id}
                    onValueChange={(value) => updateTask(task.id, 'project_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <ProjectIcon iconName={project.icon} />
                            <span>{project.project_name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !task.date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {task.date ? format(task.date, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={task.date}
                        onSelect={(date) => updateTask(task.id, 'date', date || new Date())}
                        disabled={(date) => {
                          const today = startOfDay(new Date());
                          const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
                          return isAfter(date, today) || isBefore(date, sevenDaysAgo);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    You can only submit tasks from today to last 7 days
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Task Name *</Label>
                <Input
                  value={task.task_name}
                  onChange={(e) => updateTask(task.id, 'task_name', e.target.value)}
                  placeholder="Enter task name"
                  maxLength={200}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Hours *</Label>
                  <Input
                    type="number"
                    value={task.hours}
                    onChange={(e) => updateTask(task.id, 'hours', e.target.value)}
                    min="0"
                    max="23"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter hours (0-23)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Minutes *</Label>
                  <Input
                    type="number"
                    value={task.minutes}
                    onChange={(e) => updateTask(task.id, 'minutes', e.target.value)}
                    min="0"
                    max="59"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter minutes (0-59)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={task.notes}
                  onChange={(e) => updateTask(task.id, 'notes', e.target.value)}
                  placeholder="Optional notes"
                  maxLength={500}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        <Button onClick={handleSaveAll} disabled={loading} size="lg">
          {loading ? 'Saving...' : `Save All (${tasks.length} task${tasks.length > 1 ? 's' : ''})`}
        </Button>
      </div>
    </div>
  );
};

export default AddTask;

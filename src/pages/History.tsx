import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Edit, Trash2, Search } from 'lucide-react';
import ProjectIcon from '@/components/ProjectIcon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Task {
  id: string;
  date: string;
  task_name: string;
  hours: number;
  minutes: number;
  total_minutes: number;
  notes: string | null;
  project_id: string;
  projects: { project_name: string; icon: string | null };
}

const History = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<'date' | 'project'>('date');
  const [loading, setLoading] = useState(true);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, groupBy]);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*, projects(project_name, icon)')
      .eq('user_id', user?.id)
      .order('date', { ascending: false });

    if (!error && data) {
      setTasks(data as Task[]);
    }
    setLoading(false);
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter((task) =>
        task.task_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  const formatDuration = (hours: number, minutes: number) => {
    return `${hours}h ${minutes}m`;
  };

  const handleDelete = async () => {
    if (!deleteTaskId) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', deleteTaskId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } else {
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
      fetchTasks();
    }

    setDeleteTaskId(null);
  };

  const groupedTasks = () => {
    if (groupBy === 'date') {
      return filteredTasks.reduce((acc: { [key: string]: Task[] }, task) => {
        if (!acc[task.date]) {
          acc[task.date] = [];
        }
        acc[task.date].push(task);
        return acc;
      }, {});
    } else {
      return filteredTasks.reduce((acc: { [key: string]: Task[] }, task) => {
        const projectName = task.projects.project_name;
        if (!acc[projectName]) {
          acc[projectName] = [];
        }
        acc[projectName].push(task);
        return acc;
      }, {});
    }
  };

  const calculateGroupTotal = (tasks: Task[]) => {
    const totalMinutes = tasks.reduce((acc, task) => acc + task.total_minutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return formatDuration(hours, minutes);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  const grouped = groupedTasks();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Task History</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by task name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Group by Date</SelectItem>
                <SelectItem value="project">Group by Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No tasks found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([groupKey, groupTasks]) => (
            <Card key={groupKey}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {groupBy === 'date'
                      ? format(new Date(groupKey), 'PPP')
                      : groupKey}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Total: {calculateGroupTotal(groupTasks)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {groupBy === 'date' && <TableHead>Project</TableHead>}
                      {groupBy === 'project' && <TableHead>Date</TableHead>}
                      <TableHead>Task Name</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupTasks.map((task) => (
                      <TableRow key={task.id}>
                        {groupBy === 'date' && (
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <ProjectIcon iconName={task.projects.icon} />
                              <span>{task.projects.project_name}</span>
                            </div>
                          </TableCell>
                        )}
                        {groupBy === 'project' && (
                          <TableCell className="font-medium">
                            {format(new Date(task.date), 'PPP')}
                          </TableCell>
                        )}
                        <TableCell>{task.task_name}</TableCell>
                        <TableCell>
                          {formatDuration(task.hours, task.minutes)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {task.notes || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive-foreground hover:bg-destructive"
                            onClick={() => setDeleteTaskId(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;

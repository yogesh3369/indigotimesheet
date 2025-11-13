import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, Calendar, FileText, TrendingUp } from 'lucide-react';
import { format, subDays, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';

interface Task {
  id: string;
  date: string;
  hours: number;
  minutes: number;
  total_minutes: number;
  project_id: string;
  projects: { project_name: string; icon: string | null };
}

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, dateRange]);

  const fetchTasks = async () => {
    setLoading(true);
    const daysAgo = parseInt(dateRange);
    const startDate = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('tasks')
      .select('*, projects(project_name, icon)')
      .eq('user_id', user?.id)
      .gte('date', startDate)
      .order('date', { ascending: true });

    if (!error && data) {
      setTasks(data as Task[]);
    }
    setLoading(false);
  };

  const calculateStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const weekStart = startOfWeek(new Date());
    const monthStart = startOfMonth(new Date());

    const todayTasks = tasks.filter(t => t.date === today);
    const weekTasks = tasks.filter(t => isWithinInterval(new Date(t.date), { start: weekStart, end: new Date() }));
    const monthTasks = tasks.filter(t => isWithinInterval(new Date(t.date), { start: monthStart, end: new Date() }));

    return {
      today: todayTasks.reduce((acc, t) => acc + t.total_minutes, 0) / 60,
      week: weekTasks.reduce((acc, t) => acc + t.total_minutes, 0) / 60,
      month: monthTasks.reduce((acc, t) => acc + t.total_minutes, 0) / 60,
      total: tasks.length,
    };
  };

  const prepareChartData = () => {
    const grouped = tasks.reduce((acc: any, task) => {
      const date = task.date;
      if (!acc[date]) {
        acc[date] = { date, total: 0 };
      }
      acc[date].total += task.total_minutes / 60;
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const stats = calculateStats();
  const chartData = prepareChartData();

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today.toFixed(1)}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.week.toFixed(1)}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.month.toFixed(1)}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Consumption</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'PPP')}
                formatter={(value: number) => [`${value.toFixed(2)}h`, 'Hours']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Total Hours"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

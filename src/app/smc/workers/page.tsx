'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Report, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HardHat, Activity, CheckCircle, Mail } from 'lucide-react';

interface WorkerStats {
  active: number;
  completed: number;
}

export default function SmcWorkersPage() {
  const firestore = useFirestore();

  const workersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'worker'));
  }, [firestore]);

  const reportsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'reports'));
  }, [firestore]);

  const { data: workers, isLoading: areWorkersLoading } = useCollection<User>(workersQuery);
  const { data: reports, isLoading: areReportsLoading } = useCollection<Report>(reportsQuery);

  const workerData = useMemo(() => {
    if (!workers || !reports) return null;

    const stats: Record<string, WorkerStats> = {};

    workers.forEach(worker => {
      stats[worker.name] = { active: 0, completed: 0 };
    });

    reports.forEach(report => {
      if (report.assignedContractor && stats[report.assignedContractor]) {
        if (report.status === 'Resolved' || report.status === 'Rejected') {
          stats[report.assignedContractor].completed++;
        } else if (report.status === 'Assigned' || report.status === 'In Progress') {
          stats[report.assignedContractor].active++;
        }
      }
    });

    return workers.map(worker => ({
      ...worker,
      stats: stats[worker.name] || { active: 0, completed: 0 },
    })).sort((a,b) => b.stats.active - a.stats.active);

  }, [workers, reports]);

  const isLoading = areWorkersLoading || areReportsLoading;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 md:p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Field Worker Management</h1>
        <p className="text-base md:text-lg">Monitor and manage all field personnel.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HardHat /> Worker Roster</CardTitle>
          <CardDescription>
            A list of all registered field workers and their current workload.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead className="text-center"><Activity className="inline-block mr-1 h-4 w-4" /> <span className="hidden sm:inline">Active Tasks</span><span className="sm:hidden">Active</span></TableHead>
                <TableHead className="text-center hidden sm:table-cell"><CheckCircle className="inline-block mr-1 h-4 w-4" /> Completed</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-6 w-32" /></div></TableCell>
                  <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-40" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && workerData?.map(worker => (
                <TableRow key={worker.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarFallback>{worker.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium text-sm sm:text-base">{worker.name}</span>
                        <div className="text-xs text-muted-foreground sm:hidden">
                          {worker.stats.completed} completed
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-base sm:text-lg">{worker.stats.active}</TableCell>
                  <TableCell className="text-center font-semibold text-lg hidden sm:table-cell">{worker.stats.completed}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <a href={`mailto:${worker.email}`} className="text-muted-foreground hover:text-primary flex items-center gap-2">
                        <Mail className="h-4 w-4" /> <span className="truncate max-w-[150px]">{worker.email}</span>
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          {!isLoading && (!workerData || workerData.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              No users with the 'worker' role found in the database.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

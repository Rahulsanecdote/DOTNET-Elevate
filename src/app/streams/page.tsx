'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Stream } from '@/lib/firestore-types';
import { PageHeader, PageHeaderText, PageHeaderDescription } from '@/components/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function StreamsPage() {
  const { firestore } = useFirebase();

  const streamsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'streams'), orderBy('lastSeenAt', 'desc'));
  }, [firestore]);

  const { data: streams, isLoading, error } = useCollection<Stream>(streamsQuery);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader>
        <PageHeaderText>Data Streams</PageHeaderText>
        <PageHeaderDescription>
          Live streams of data being ingested into the system. Click a stream to inspect its events and schema.
        </PageHeaderDescription>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stream ID</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Event Count</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="h-16"><div className="animate-pulse bg-muted/50 rounded-md h-8 w-48"></div></TableCell>
                      <TableCell className="h-16"><div className="animate-pulse bg-muted/50 rounded-md h-8 w-32"></div></TableCell>
                      <TableCell className="h-16"><div className="animate-pulse bg-muted/50 rounded-md h-8 w-16"></div></TableCell>
                      <TableCell className="h-16"><div className="animate-pulse bg-muted/50 rounded-md h-8 w-24"></div></TableCell>
                    </TableRow>
                  ))
                )}
                {!isLoading && streams && streams.length > 0 && streams.map((stream) => (
                  <TableRow key={stream.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                         <Activity className="h-5 w-5 text-primary shrink-0" />
                        <Link href={`/streams/${stream.id}`} className="hover:underline break-all">
                          {stream.id}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                          <Clock className="h-4 w-4 shrink-0" />
                          {stream.lastSeenAt ? formatDistanceToNow(stream.lastSeenAt.toDate(), { addSuffix: true }) : 'Never'}
                      </div>
                      </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{stream.stats?.eventCount ?? 0}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/streams/${stream.id}`}>
                          Inspect <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {!isLoading && (!streams || streams.length === 0) && (
                  <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                         <p className="text-muted-foreground">No streams found.</p>
                         <p className="text-sm text-muted-foreground/80 mt-2">Send data to an ingestion endpoint like <code>/api/ingest/your-stream-name</code> to get started.</p>
                      </TableCell>
                  </TableRow>
                 )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {error && <p className="text-destructive mt-4">{error.message}</p>}
    </div>
  );
}

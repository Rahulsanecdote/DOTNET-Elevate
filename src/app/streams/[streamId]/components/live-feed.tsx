'use client';
import { useState, useMemo } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Pause, Play, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/lib/firestore-types';
import EventDetailDrawer from './event-detail-drawer';

const statusColors: { [key: string]: string } = {
  OK: 'bg-green-500/20 text-green-400 border-green-500/30',
  FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
  PARTIAL: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export default function LiveFeed({ streamId }: { streamId: string }) {
  const { firestore } = useFirebase();
  const [isPaused, setIsPaused] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<(Event & {id: string}) | null>(null);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || isPaused) return null;
    return query(
      collection(firestore, 'streams', streamId, 'events'),
      orderBy('receivedAt', 'desc'),
      limit(50)
    );
  }, [firestore, streamId, isPaused]);

  const { data: events, isLoading } = useCollection<Event>(eventsQuery);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? <Play className="mr-2" /> : <Pause className="mr-2" />}
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
      </div>
      <div className="space-y-3">
         {isLoading && !events && <p className="text-muted-foreground">Loading events...</p>}
         {!isLoading && events && events.length === 0 && (
            <Card className="h-24 flex items-center justify-center border-dashed">
                <p className="text-muted-foreground">Waiting for events...</p>
            </Card>
         )}
        {events?.map((event) => (
          <Card key={event.id} className="p-4 flex justify-between items-center hover:bg-card/80 transition-colors">
            <div className="flex flex-col gap-1 overflow-hidden">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusColors[event.parseStatus]}>{event.parseStatus}</Badge>
                    <p className="text-sm text-muted-foreground font-mono">
                        {event.receivedAt ? formatDistanceToNow(event.receivedAt.toDate(), { addSuffix: true }) : ''}
                    </p>
                </div>
                 <p className="text-sm font-mono truncate">
                    {event.rawPayload}
                </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedEvent(event)}>
                <Eye className="h-5 w-5"/>
            </Button>
          </Card>
        ))}
      </div>
      <EventDetailDrawer
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import type { Event } from '@/lib/firestore-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import React from 'react';

interface EventDetailDrawerProps {
  event: (Event & { id: string }) | null;
  isOpen: boolean;
  onClose: () => void;
}

const JsonViewer = ({ data }: { data: any }) => {
    if (typeof data === 'undefined' || data === null) {
        return <div className="text-muted-foreground italic">null</div>;
    }
    return (
        <pre className="bg-muted/50 p-4 rounded-md text-sm overflow-x-auto">
            {JSON.stringify(data, null, 2)}
        </pre>
    );
};

const statusColors: { [key: string]: string } = {
  OK: 'bg-green-500/20 text-green-400 border-green-500/30',
  FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
  PARTIAL: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};


export default function EventDetailDrawer({ event, isOpen, onClose }: EventDetailDrawerProps) {
  if (!event) return null;

  let rawContent: React.ReactNode;
  if (event.contentType.includes('json')) {
      try {
          const parsed = JSON.parse(event.rawPayload);
          rawContent = <JsonViewer data={parsed} />;
      } catch {
          rawContent = <pre className="bg-muted/50 p-4 rounded-md text-sm overflow-x-auto">{event.rawPayload}</pre>;
      }
  } else if (event.contentType.includes('text')) {
      rawContent = <pre className="bg-muted/50 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap break-words">{event.rawPayload}</pre>;
  } else {
       rawContent = (
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Binary data (Base64 encoded):</p>
                <pre className="bg-muted/50 p-4 rounded-md text-sm overflow-x-auto break-all">{event.rawPayload}</pre>
            </div>
       )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Event Details</SheetTitle>
          <SheetDescription className="font-mono break-all">{event.id}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
             <div className="flex flex-wrap gap-2">
                 <Badge variant="outline" className={statusColors[event.parseStatus]}>
                    Status: {event.parseStatus}
                 </Badge>
                 <Badge variant="secondary">Size: {event.sizeBytes} bytes</Badge>
                 <Badge variant="secondary">Type: {event.contentType}</Badge>
            </div>

            <Tabs defaultValue="parsed">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="parsed">Parsed</TabsTrigger>
                    <TabsTrigger value="raw">Raw</TabsTrigger>
                    <TabsTrigger value="meta">Metadata</TabsTrigger>
                </TabsList>
                <TabsContent value="parsed" className="mt-4">
                   <h3 className="font-semibold mb-2">Parsed JSON</h3>
                   {event.parsedJson ? (
                        <JsonViewer data={event.parsedJson} />
                   ) : (
                        <p className="text-muted-foreground text-sm">No parseable JSON content.</p>
                   )}
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                     <h3 className="font-semibold mb-2">Raw Payload</h3>
                    {rawContent}
                </TabsContent>
                <TabsContent value="meta" className="mt-4">
                     <h3 className="font-semibold mb-2">Metadata</h3>
                     <JsonViewer data={event.metadata ?? {}} />
                     <h3 className="font-semibold mb-2 mt-4">Schema Version ID</h3>
                     <p className="font-mono text-sm bg-muted p-2 rounded-md break-all">{event.schemaVersionId}</p>
                </TabsContent>
            </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

'use client';
import { useMemo } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { SchemaVersion, SchemaField } from '@/lib/firestore-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const typeColors: { [key: string]: string } = {
  string: 'text-green-400',
  integer: 'text-blue-400',
  float: 'text-blue-300',
  boolean: 'text-purple-400',
  datetime: 'text-cyan-400',
  object: 'text-yellow-400',
  array: 'text-orange-400',
  mixed: 'text-red-400',
  null: 'text-gray-500',
};

function FieldRow({ field }: { field: SchemaField }) {
  return (
    <div className="flex justify-between items-center py-2 px-2 rounded-md hover:bg-muted/50">
        <div className="font-mono text-sm break-all pr-4">{field.path}</div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`font-mono text-sm ${typeColors[field.type] || 'text-gray-400'}`}>
                {field.type}
            </span>
            {field.nullable && <Badge variant="outline">nullable</Badge>}
        </div>
    </div>
  )
}

export default function SchemaViewer({ streamId }: { streamId: string }) {
  const { firestore } = useFirebase();

  const schemaVersionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'streams', streamId, 'schemaVersions'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, streamId]);

  const { data: schemaVersions, isLoading } = useCollection<SchemaVersion>(schemaVersionsQuery);

  return (
    <div className="space-y-4">
       {isLoading && <p className="text-muted-foreground">Loading schemas...</p>}
       {!isLoading && schemaVersions && schemaVersions.length === 0 && (
            <Card className="h-24 flex items-center justify-center border-dashed">
                <p className="text-muted-foreground">No schema versions found yet.</p>
            </Card>
       )}
      <Accordion type="single" collapsible defaultValue={schemaVersions?.[0]?.id}>
         {schemaVersions?.map((sv) => (
          <AccordionItem value={sv.id} key={sv.id}>
            <AccordionTrigger>
              <div className="flex flex-col items-start gap-1 text-left">
                <span className="font-semibold">Schema Version</span>
                <span className="text-xs text-muted-foreground font-mono break-all">{sv.shapeHash.substring(0, 12)}</span>
              </div>
               <div className="text-sm text-muted-foreground text-right ml-4 shrink-0">
                Created {sv.createdAt ? format(sv.createdAt.toDate(), 'PPP p') : ''}
              </div>
            </AccordionTrigger>
            <AccordionContent>
               <Card>
                <CardHeader>
                    <CardTitle>Fields</CardTitle>
                    <CardDescription>{sv.fields.length} unique fields identified in this version.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-border">
                        {sv.fields.sort((a,b) => a.path.localeCompare(b.path)).map((field) => (
                           <FieldRow key={field.path} field={field} />
                        ))}
                    </div>
                </CardContent>
               </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

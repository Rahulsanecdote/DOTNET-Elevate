'use client';

import { PageHeader, PageHeaderText, PageHeaderDescription } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams } from 'next/navigation';
import { Activity, Code, List, Search } from 'lucide-react';
import LiveFeed from './components/live-feed';
import SchemaViewer from './components/schema-viewer';

export default function StreamDetailPage() {
  const params = useParams();
  const streamId = params.streamId as string;

  if (!streamId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader>
        <div className="flex items-center gap-2 text-muted-foreground">
            <Activity />
            <span>Stream</span>
        </div>
        <PageHeaderText className="break-all">{streamId}</PageHeaderText>
        <PageHeaderDescription>
          Inspect live events, view schema evolution, and search through the data for this stream.
        </PageHeaderDescription>
      </PageHeader>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="feed">
            <List className="mr-2" /> Live Feed
          </TabsTrigger>
          <TabsTrigger value="schema">
            <Code className="mr-2" /> Schema
          </TabsTrigger>
          <TabsTrigger value="search" disabled>
             <Search className="mr-2" /> Search
          </TabsTrigger>
        </TabsList>
        <TabsContent value="feed" className="mt-4">
          <LiveFeed streamId={streamId} />
        </TabsContent>
        <TabsContent value="schema" className="mt-4">
          <SchemaViewer streamId={streamId} />
        </TabsContent>
        <TabsContent value="search">
            <p>Search functionality coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

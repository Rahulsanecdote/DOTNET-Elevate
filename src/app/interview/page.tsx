import Link from "next/link";
import { PageHeader, PageHeaderDescription, PageHeaderText } from '@/components/page-header';
import { Button } from "@/components/ui/button";

export default function InterviewPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader>
                <PageHeaderText>Interview Prep Hub</PageHeaderText>
                <PageHeaderDescription>
                    Tools and resources to help you ace your .NET developer interviews.
                </PageHeaderDescription>
            </PageHeader>
            <div className="flex flex-col items-center justify-center text-center">
                 <p className="mb-4">This section will host all interview preparation features.</p>
                 <Button asChild>
                    <Link href="/interview/star-builder">Go to STAR Story Builder</Link>
                </Button>
            </div>
        </div>
    );
}
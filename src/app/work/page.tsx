import Link from "next/link";
import { PageHeader, PageHeaderDescription, PageHeaderText } from '@/components/page-header';
import { Button } from "@/components/ui/button";

export default function WorkPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader>
                <PageHeaderText>On-the-Job Copilot</PageHeaderText>
                <PageHeaderDescription>
                    AI-powered assistance for your daily development tasks.
                </PageHeaderDescription>
            </PageHeader>
            <div className="flex flex-col items-center justify-center text-center">
                 <p className="mb-4">This section will host tools to help you on the job.</p>
                 <Button asChild>
                    <Link href="/work/code-review">Go to AI Code Reviewer</Link>
                </Button>
            </div>
        </div>
    );
}
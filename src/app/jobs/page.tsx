"use client";

import { useState } from "react";
import type { JobApplication } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, PageHeaderDescription, PageHeaderText } from "@/components/page-header";
import { PlusCircle } from "lucide-react";

const initialJobs: JobApplication[] = [
  {
    id: "1",
    company: "Microsoft",
    role: "Software Engineer II",
    status: "Interviewing",
    dateApplied: "2024-05-15",
    contact: "recruiter@ms.com",
  },
  {
    id: "2",
    company: "Amazon",
    role: ".NET Developer",
    status: "Applied",
    dateApplied: "2024-05-20",
  },
  {
    id: "3",
    company: "Google",
    role: "Cloud Engineer",
    status: "Rejected",
    dateApplied: "2024-04-30",
  },
];

const statusColors: { [key in JobApplication["status"]]: string } = {
    Applied: "bg-blue-500",
    Interviewing: "bg-yellow-500",
    Offer: "bg-green-500",
    Rejected: "bg-red-500",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobApplication[]>(initialJobs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddJob = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newJob: JobApplication = {
      id: (jobs.length + 1).toString(),
      company: formData.get("company") as string,
      role: formData.get("role") as string,
      status: (formData.get("status") as JobApplication["status"]) || "Applied",
      dateApplied: new Date().toISOString().split("T")[0],
      contact: formData.get("contact") as string,
    };
    setJobs([newJob, ...jobs]);
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader>
        <div className="flex items-center justify-between">
            <PageHeaderText>Job Application Tracker</PageHeaderText>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Application
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Job Application</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddJob} className="space-y-4">
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" name="company" required />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" name="role" required />
                  </div>
                  <div>
                    <Label htmlFor="contact">Contact (Optional)</Label>
                    <Input id="contact" name="contact" type="email" />
                  </div>
                   <div>
                    <Label htmlFor="status">Status</Label>
                     <Select name="status" defaultValue="Applied">
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Applied">Applied</SelectItem>
                            <SelectItem value="Interviewing">Interviewing</SelectItem>
                            <SelectItem value="Offer">Offer</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Add Job</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
        <PageHeaderDescription>
          Keep track of your job search pipeline. Add, update, and manage all your applications.
        </PageHeaderDescription>
      </PageHeader>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.company}</TableCell>
                <TableCell>{job.role}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`text-white ${statusColors[job.status]}`}>
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>{job.dateApplied}</TableCell>
                <TableCell>{job.contact || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

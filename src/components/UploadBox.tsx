"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, File as FileIcon, Loader2, X, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirebase } from "@/firebase";
import { extractTextFromDocx } from "@/lib/extract/docx";
import { extractTextFromPdf } from "@/lib/extract/pdf";
import { extractTextFromTxt } from "@/lib/extract/txt";
import { sanitizeText } from "@/lib/sanitize/pii";
import { computeInputHash } from "@/lib/hash/inputHash";
import { createInterviewKitRequest } from "@/lib/api/interviewKitClient";
import { uploadFileForUser } from "@/lib/storage/upload";


const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type Status =
  | "idle"
  | "validating"
  | "uploading"
  | "extracting"
  | "sanitizing"
  | "hashing"
  | "requesting"
  | "error";

const statusMessages: Record<Status, string> = {
  idle: "",
  validating: "Validating files...",
  uploading: "Uploading files to secure storage...",
  extracting: "Extracting text from documents...",
  sanitizing: "Sanitizing personal information...",
  hashing: "Creating secure hash...",
  requesting: "Requesting kit generation...",
  error: "An error occurred.",
};

type UploadBoxProps = {
  onKitCreated: (kitId: string) => void;
};

export function UploadBox({ onKitCreated }: UploadBoxProps) {
  const { user, storage } = useFirebase();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);
  const [isStorageEnabled, setIsStorageEnabled] = useState(false);
  const [useBoth, setUseBoth] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const jdInputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = (file: File) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `Invalid file type. Please upload a PDF, DOCX, or TXT file.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large. Maximum size is 10MB.`;
    }
    return null;
  };
  
  const handleFileSelect = (files: FileList | null, isForJd: boolean) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validationError = handleFileValidation(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (isForJd) {
        setJdFile(file);
    } else {
        setResumeFile(file);
    }
    setError(null);
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // This is necessary to allow dropping
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>, isForJd: boolean) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files, isForJd);
  };
  
  const extractTextFromFile = async (file: File): Promise<string> => {
    switch (file.type) {
      case 'application/pdf':
        return extractTextFromPdf(file);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return extractTextFromDocx(file);
      case 'text/plain':
        return extractTextFromTxt(file);
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }
  };


  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleSubmit = async () => {
    if (!resumeFile && !jdFile) {
        setError("Please upload at least a resume or a job description.");
        return;
    }
    if (!user || !storage) {
        setError("Could not identify user or connect to storage. Please try refreshing the page.");
        return;
    }
    
    setError(null);
    setStatus("validating");

    try {
        const kitId = crypto.randomUUID();
        let resumeText: string | undefined;
        let jdText: string | undefined;
        let resumeFileUrl: string | undefined;
        let jdFileUrl: string | undefined;

        if (isStorageEnabled) {
          setStatus("uploading");
          if (resumeFile) {
            const result = await uploadFileForUser(storage, user.uid, kitId, resumeFile, 'resume');
            resumeFileUrl = result.downloadUrl;
          }
          if (jdFile) {
             const result = await uploadFileForUser(storage, user.uid, kitId, jdFile, 'jd');
            jdFileUrl = result.downloadUrl;
          }
        }
        
        setStatus("extracting");
        if (resumeFile) {
            resumeText = await extractTextFromFile(resumeFile);
        }
        if (jdFile) {
            jdText = await extractTextFromFile(jdFile);
        }
        
        setStatus("sanitizing");
        const { sanitized: sanitizedResume } = sanitizeText(resumeText || '', { privacyMode: isPrivacyMode });
        const { sanitized: sanitizedJd } = sanitizeText(jdText || '', { privacyMode: isPrivacyMode });
        
        setStatus("hashing");
        const inputHash = await computeInputHash({ resume: sanitizedResume, jd: sanitizedJd, targetRole });

        setStatus("requesting");
        const newKitId = await createInterviewKitRequest(user, {
            kitId,
            inputHash,
            resumeText: sanitizedResume,
            jdText: sanitizedJd,
            targetRole,
            resumeFileUrl,
            jdFileUrl,
        });

        onKitCreated(newKitId);

    } catch (e: any) {
        console.error(e);
        setError(e.message || "An unexpected error occurred during processing.");
        setStatus("error");
    }
  };

  const isGenerating = status !== "idle" && status !== "error";

  function renderFilePill(file: File, onRemove: () => void) {
    return (
      <div className="flex items-center justify-between rounded-full bg-muted p-2 pl-4 text-sm">
          <div className="flex items-center gap-2 overflow-hidden">
              <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate" title={file.name}>{file.name}</span>
              <span className="text-muted-foreground whitespace-nowrap">({formatBytes(file.size)})</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full flex-shrink-0" onClick={onRemove} disabled={isGenerating}>
              <X className="h-4 w-4" />
          </Button>
      </div>
    );
  }

  function renderDropzone(isForJd = false) {
    const inputRef = isForJd ? jdInputRef : resumeInputRef;
    return (
      <div
          className={cn(
              "flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors",
              isDragging ? "border-primary bg-primary/10" : "hover:bg-muted/50",
              isGenerating && "cursor-not-allowed opacity-50"
          )}
          onClick={() => !isGenerating && inputRef.current?.click()}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, isForJd)}
      >
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground text-center px-4">
              <UploadCloud className="h-10 w-10" />
              <p className="font-semibold">{isForJd ? "Drop Job Description here" : "Drop Resume here"}</p>
              <p className="text-xs">PDF, DOCX, or TXT (max 10MB)</p>
          </div>
          <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files, isForJd)}
              accept={ALLOWED_FILE_TYPES.join(",")}
              disabled={isGenerating}
          />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 md:items-end">
            <div className="space-y-1.5 flex-grow">
                <Label htmlFor="targetRole">Target Role (Optional)</Label>
                <Input
                    id="targetRole"
                    placeholder="e.g. Senior .NET Backend Developer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    disabled={isGenerating}
                />
            </div>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                    <Switch id="storageMode" checked={isStorageEnabled} onCheckedChange={setIsStorageEnabled} disabled={isGenerating} />
                    <Label htmlFor="storageMode" className="flex items-center gap-1.5">
                      <FileUp className="h-4 w-4"/> Save Files
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="privacyMode" checked={isPrivacyMode} onCheckedChange={setIsPrivacyMode} disabled={isGenerating} />
                    <Label htmlFor="privacyMode">Privacy Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="useBoth" checked={useBoth} onCheckedChange={setUseBoth} disabled={isGenerating} />
                    <Label htmlFor="useBoth">Resume + JD</Label>
                </div>
            </div>
          </div>

          <div className={cn("grid gap-4", useBoth ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
            <div>
                <Label className="mb-2 block">{useBoth ? "Resume*" : "Resume or Job Description*"}</Label>
                {resumeFile ? renderFilePill(resumeFile, () => setResumeFile(null)) : renderDropzone(false)}
            </div>
            {useBoth && (
                <div>
                    <Label className="mb-2 block">Job Description*</Label>
                    {jdFile ? renderFilePill(jdFile, () => setJdFile(null)) : renderDropzone(true)}
                </div>
            )}
          </div>
          
          {error && <p className="text-center text-sm text-destructive">{error}</p>}
          
          <Button onClick={handleSubmit} disabled={isGenerating || (!resumeFile && !jdFile)} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {statusMessages[status]}
              </>
            ) : (
              "Generate Kit"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

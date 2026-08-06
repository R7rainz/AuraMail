import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  CalendarCheck,
  CalendarPlus,
  Check,
  ChevronLeft,
  ClipboardCheck,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  MapPin,
  MessagesSquare,
  Paperclip,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { EmailAttachment, PlacementEmail } from "../types";
import {
  downloadAttachment,
  fetchAttachmentBlob,
  formatFileSize,
  isPreviewable,
} from "../lib/attachments";
import { formatMailDateTime } from "../lib/dateUtils";
import { getRunway, runwayTextClass } from "../lib/runway";
import { RunwayBar } from "./Runway";

interface EmailDetailViewProps {
  email: PlacementEmail;
  onBack: () => void;
  inCalendar: boolean;
  addingToCalendar: boolean;
  onAddToCalendar: () => void;
  onRemoveFromCalendar: () => void;
  onToggleImportant: () => void;
}

function AttachmentRow({
  gmailMessageId,
  attachment,
}: {
  gmailMessageId: string;
  attachment: EmailAttachment;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewable = isPreviewable(attachment.mimeType, attachment.size);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePreview = async () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const blob = await fetchAttachmentBlob(
        gmailMessageId,
        attachment.attachmentId,
      );
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setError("Preview didn't load. Try downloading the file instead.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      await downloadAttachment(
        gmailMessageId,
        attachment.attachmentId,
        attachment.filename,
      );
    } catch {
      setError("Download failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted">
            <Paperclip className="size-4 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{attachment.filename}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {formatFileSize(attachment.size)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {previewable && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handlePreview}
              disabled={loading}
              aria-label={previewUrl ? "Hide preview" : "Preview file"}
            >
              <Eye />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDownload}
            disabled={loading}
            aria-label={`Download ${attachment.filename}`}
          >
            <Download />
          </Button>
        </div>
      </div>

      {error && (
        <p className="px-3 pb-3 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      {previewUrl &&
        (attachment.mimeType.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={attachment.filename}
            className="max-h-96 w-full border-t bg-muted object-contain"
          />
        ) : (
          <iframe
            src={previewUrl}
            title={attachment.filename}
            className="h-96 w-full border-t bg-muted"
          />
        ))}
    </Card>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: unknown;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium">
        {typeof value === "string" ? value : JSON.stringify(value)}
      </p>
    </div>
  );
}

function Prose({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </h3>
      <div className="mt-3 border-l-2 pl-4 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export function EmailDetailView({
  email,
  onBack,
  inCalendar,
  addingToCalendar,
  onAddToCalendar,
  onRemoveFromCalendar,
  onToggleImportant,
}: EmailDetailViewProps) {
  const messages = email.threadMessages || [email];
  const [selectedMessageId, setSelectedMessageId] = useState(email.id);
  const selectedEmail =
    messages.find((message) => message.id === selectedMessageId) || messages[0];

  const runway = selectedEmail.deadline
    ? getRunway(selectedEmail.deadline, selectedEmail.receivedAt)
    : null;

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="scrollbar-thin absolute inset-0 overflow-y-auto"
    >
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-background/85 px-3 py-3 backdrop-blur-xl sm:px-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="group -ml-2">
          <ChevronLeft className="transition-transform group-hover:-translate-x-0.5" />
          Back
        </Button>

        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleImportant}
            aria-pressed={!!email.important}
            aria-label={
              email.important ? "Unmark as important" : "Mark as important"
            }
            className={cn(email.important && "text-soon")}
          >
            <Star className={cn(email.important && "fill-current")} />
          </Button>

          {selectedEmail.deadline &&
            (inCalendar ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onRemoveFromCalendar}
                disabled={addingToCalendar}
              >
                <CalendarCheck className="text-open" />
                On your calendar
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddToCalendar}
                disabled={addingToCalendar}
              >
                <CalendarPlus />
                Add to calendar
              </Button>
            ))}

          {selectedEmail.applyLink && (
            <Button size="sm" asChild>
              <a
                href={selectedEmail.applyLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply
                <ExternalLink />
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        {/* Identity */}
        <header>
          <Badge variant="outline" className="capitalize">
            {selectedEmail.category || "Announcement"}
          </Badge>

          <h1 className="display mt-4 text-3xl leading-tight font-medium text-balance sm:text-4xl">
            {selectedEmail.company || selectedEmail.subject}
          </h1>

          {selectedEmail.role && selectedEmail.company && (
            <p className="mt-2 text-lg text-muted-foreground">
              {selectedEmail.role}
            </p>
          )}

          <p className="mt-4 text-sm text-muted-foreground">
            {selectedEmail.sender || "Unknown sender"}
            <span className="px-2 text-border">/</span>
            <time dateTime={selectedEmail.receivedAt}>
              {formatMailDateTime(selectedEmail.receivedAt)}
            </time>
          </p>

          {selectedEmail.tags && selectedEmail.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {selectedEmail.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* The runway, at full width: received → now → closes. */}
        {runway && (
          <section
            aria-label="Application window"
            className="rounded-xl border p-4"
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-medium">
                {runway.status === "closed"
                  ? "Applications closed"
                  : "Application window"}
              </span>
              <span
                className={cn(
                  "font-mono text-sm font-medium tabular-nums",
                  runwayTextClass[runway.status],
                )}
              >
                {runway.label}
              </span>
            </div>

            <RunwayBar runway={runway} className="mt-3 h-1.5" />

            <div className="mt-2 flex flex-col gap-1 font-mono text-xs text-muted-foreground sm:flex-row sm:justify-between">
              <span>Received {formatMailDateTime(selectedEmail.receivedAt)}</span>
              <span>{runway.detail}</span>
            </div>
          </section>
        )}

        {/* AI brief */}
        {selectedEmail.summary && (
          <Card className="gap-0 border-primary/20 bg-primary/[0.04] py-0">
            <CardContent className="p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="size-4" />
                Brief
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-foreground/90">
                {selectedEmail.summary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Thread */}
        {messages.length > 1 && (
          <section aria-label="Conversation">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <MessagesSquare className="size-4 text-muted-foreground" />
              Conversation
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {messages.length}
              </span>
            </h2>

            <ul className="mt-3 divide-y rounded-xl border">
              {messages.map((message, index) => {
                const active = message.id === selectedEmail.id;
                return (
                  <li key={message.id}>
                    <button
                      onClick={() => setSelectedMessageId(message.id)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 p-3 text-left transition-colors outline-none",
                        "first:rounded-t-xl last:rounded-b-xl",
                        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        active ? "bg-accent" : "hover:bg-accent/50",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-full border font-mono text-xs",
                          active
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        {active ? (
                          <Check className="size-4" />
                        ) : (
                          messages.length - index
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="truncate text-sm font-medium">
                            {message.sender || "Unknown sender"}
                          </span>
                          <time
                            dateTime={message.receivedAt}
                            className="shrink-0 font-mono text-xs text-muted-foreground"
                          >
                            {formatMailDateTime(message.receivedAt)}
                          </time>
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                          {message.summary || message.snippet}
                        </span>
                      </span>

                      {!!message.attachments?.length && (
                        <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Extracted fields */}
        {(selectedEmail.deadline ||
          selectedEmail.salary ||
          selectedEmail.location ||
          selectedEmail.timings) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {selectedEmail.deadline && (
              <Field
                icon={Clock}
                label="Closes"
                value={new Date(selectedEmail.deadline).toLocaleString(
                  undefined,
                  { dateStyle: "long", timeStyle: "short" },
                )}
              />
            )}
            {selectedEmail.salary && (
              <Field
                icon={Banknote}
                label="Compensation"
                value={selectedEmail.salary}
              />
            )}
            {selectedEmail.location && (
              <Field
                icon={MapPin}
                label="Location"
                value={selectedEmail.location}
              />
            )}
            {selectedEmail.timings && (
              <Field icon={Clock} label="Timings" value={selectedEmail.timings} />
            )}
          </div>
        )}

        {/* Attachments */}
        {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Paperclip className="size-4 text-muted-foreground" />
              Attachments
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {selectedEmail.attachments.length}
              </span>
            </h2>
            <div className="mt-3 space-y-2">
              {selectedEmail.attachments.map((attachment) => (
                <AttachmentRow
                  key={attachment.attachmentId}
                  gmailMessageId={selectedEmail.gmailMessageId}
                  attachment={attachment}
                />
              ))}
            </div>
          </section>
        )}

        {(selectedEmail.eligibility ||
          selectedEmail.requirements ||
          selectedEmail.description) && <Separator />}

        <div className="space-y-8">
          {selectedEmail.eligibility && (
            <Prose icon={User} title="Eligibility">
              {typeof selectedEmail.eligibility === "string"
                ? selectedEmail.eligibility
                : JSON.stringify(selectedEmail.eligibility)}
            </Prose>
          )}
          {selectedEmail.requirements && (
            <Prose icon={ClipboardCheck} title="Requirements">
              {typeof selectedEmail.requirements === "string"
                ? selectedEmail.requirements
                : JSON.stringify(selectedEmail.requirements)}
            </Prose>
          )}
          {selectedEmail.description && (
            <Prose icon={FileText} title="Full message">
              {selectedEmail.description}
            </Prose>
          )}
        </div>
      </div>
    </motion.div>
  );
}

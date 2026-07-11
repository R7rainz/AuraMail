import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ExternalLink,
  CalendarCheck,
  CalendarPlus,
  Sparkles,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  User,
  ClipboardCheck,
  FileText,
  Paperclip,
  Download,
  Eye,
  MessagesSquare,
  Check,
} from "lucide-react";
import type { EmailAttachment, PlacementEmail } from "../types";
import {
  downloadAttachment,
  fetchAttachmentBlob,
  formatFileSize,
  isPreviewable,
} from "../lib/attachments";
import { formatMailDateTime } from "../lib/dateUtils";

interface EmailDetailViewProps {
  email: PlacementEmail;
  onBack: () => void;
  inCalendar: boolean;
  addingToCalendar: boolean;
  onAddToCalendar: () => void;
  onRemoveFromCalendar: () => void;
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
      setError("Failed to load preview");
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
      setError("Failed to download attachment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Paperclip className="w-4 h-4 text-gray-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {attachment.filename}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(attachment.size)} · {attachment.mimeType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {previewable && (
            <button
              onClick={handlePreview}
              disabled={loading}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              title={previewUrl ? "Hide preview" : "Preview"}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={loading}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {error && <p className="px-4 pb-3 text-xs text-rose-400">{error}</p>}
      {previewUrl &&
        (attachment.mimeType.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={attachment.filename}
            className="w-full max-h-96 object-contain border-t border-white/5 bg-black/40"
          />
        ) : (
          <iframe
            src={previewUrl}
            title={attachment.filename}
            className="w-full h-96 border-t border-white/5 bg-black/40"
          />
        ))}
    </div>
  );
}

export function EmailDetailView({
  email,
  onBack,
  inCalendar,
  addingToCalendar,
  onAddToCalendar,
  onRemoveFromCalendar,
}: EmailDetailViewProps) {
  const messages = email.threadMessages || [email];
  const [selectedMessageId, setSelectedMessageId] = useState(email.id);
  const selectedEmail =
    messages.find((message) => message.id === selectedMessageId) || messages[0];

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 overflow-y-auto custom-scrollbar z-10"
    >
      {/* Header Actions */}
      <div className="aura-panel sticky top-0 z-20 flex items-center justify-between px-6 xl:px-8 py-4 backdrop-blur-xl border-b">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
          Back
        </button>
        <div className="flex gap-3">
          {selectedEmail.applyLink && (
            <a
              href={selectedEmail.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Apply Now <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {selectedEmail.deadline &&
            (inCalendar ? (
              <button
                onClick={onRemoveFromCalendar}
                disabled={addingToCalendar}
                className="px-4 py-2 bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" /> Added to Calendar
              </button>
            ) : (
              <button
                onClick={onAddToCalendar}
                disabled={addingToCalendar}
                className="px-4 py-2 bg-white/5 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <CalendarPlus className="w-4 h-4" /> Add Event
              </button>
            ))}
        </div>
      </div>

      <div className="p-6 xl:p-10 max-w-4xl mx-auto space-y-10">
        {/* Hero Block */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 bg-[var(--aura-accent-soft)] border border-[var(--aura-line)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--aura-accent)]"></div>
            <span className="text-xs text-gray-300 font-medium tracking-wide uppercase">
              {selectedEmail.category || "Announcement"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--aura-text)] leading-tight mb-4">
            {selectedEmail.company || selectedEmail.subject}
          </h1>
          {selectedEmail.role && selectedEmail.company && (
            <p className="text-xl text-blue-400 font-medium mb-6">
              {selectedEmail.role}
            </p>
          )}

          {selectedEmail.tags && selectedEmail.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedEmail.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium rounded bg-white/5 border border-white/10 text-gray-300 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
            <span className="text-gray-200">
              {selectedEmail.sender || "Unknown sender"}
            </span>
            <span className="text-gray-700">|</span>
            <time dateTime={selectedEmail.receivedAt}>
              {formatMailDateTime(selectedEmail.receivedAt)}
            </time>
          </div>
        </div>

        {messages.length > 1 && (
          <section aria-label="Email conversation">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <MessagesSquare className="w-4 h-4" /> Conversation -{" "}
              {messages.length} messages
            </h2>
            <div className="border-y border-white/10 divide-y divide-white/5">
              {messages.map((message, index) => {
                const active = message.id === selectedEmail.id;
                return (
                  <button
                    key={message.id}
                    onClick={() => setSelectedMessageId(message.id)}
                    className={`w-full px-3 py-4 flex items-center gap-4 text-left transition-colors ${active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${active ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-300" : "border-white/10 bg-white/5 text-gray-500"}`}
                    >
                      {active ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-semibold">
                          {messages.length - index}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-gray-200 truncate">
                          {message.sender || "Unknown sender"}
                        </span>
                        <time
                          dateTime={message.receivedAt}
                          className="text-xs text-gray-500 shrink-0"
                        >
                          {formatMailDateTime(message.receivedAt)}
                        </time>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {message.summary || message.snippet}
                      </p>
                    </div>
                    {!!message.attachments?.length && (
                      <Paperclip className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* AI Summary */}
        {selectedEmail.summary && (
          <div className="p-6 border border-[var(--aura-line)] bg-[var(--aura-accent-soft)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--aura-accent)]" />
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 aura-accent" />
              <h3 className="text-sm font-semibold uppercase tracking-wider aura-accent">
                AI brief
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-[15px]">
              {selectedEmail.summary}
            </p>
          </div>
        )}

        {/* Quick Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedEmail.deadline && (
            <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Deadline
              </p>
              <p className="text-[15px] text-white font-medium">
                {new Date(selectedEmail.deadline).toLocaleString([], {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>
          )}
          {selectedEmail.salary && (
            <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />{" "}
                Compensation
              </p>
              <p className="text-[15px] text-white font-medium">
                {typeof selectedEmail.salary === "string"
                  ? selectedEmail.salary
                  : JSON.stringify(selectedEmail.salary)}
              </p>
            </div>
          )}
          {selectedEmail.location && (
            <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> Location
              </p>
              <p className="text-[15px] text-white font-medium">
                {typeof selectedEmail.location === "string"
                  ? selectedEmail.location
                  : JSON.stringify(selectedEmail.location)}
              </p>
            </div>
          )}
          {selectedEmail.timings && (
            <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" /> Timings
              </p>
              <p className="text-[15px] text-white font-medium">
                {typeof selectedEmail.timings === "string"
                  ? selectedEmail.timings
                  : JSON.stringify(selectedEmail.timings)}
              </p>
            </div>
          )}
        </div>

        {/* Attachments */}
        {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <Paperclip className="w-4 h-4" /> Attachments
            </h3>
            <div className="space-y-3">
              {selectedEmail.attachments.map((attachment) => (
                <AttachmentRow
                  key={attachment.attachmentId}
                  gmailMessageId={selectedEmail.gmailMessageId}
                  attachment={attachment}
                />
              ))}
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="space-y-10 pt-4 border-t border-white/10">
          {selectedEmail.eligibility && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Eligibility Criteria
              </h3>
              <div className="text-[15px] text-gray-300 leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-white/10">
                {typeof selectedEmail.eligibility === "string"
                  ? selectedEmail.eligibility
                  : JSON.stringify(selectedEmail.eligibility)}
              </div>
            </div>
          )}
          {selectedEmail.requirements && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" /> Requirements
              </h3>
              <div className="text-[15px] text-gray-300 leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-white/10">
                {typeof selectedEmail.requirements === "string"
                  ? selectedEmail.requirements
                  : JSON.stringify(selectedEmail.requirements)}
              </div>
            </div>
          )}
          {selectedEmail.description && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Full Description
              </h3>
              <div className="text-[15px] text-gray-400 leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-6 rounded-xl border border-white/5">
                {selectedEmail.description}
              </div>
            </div>
          )}
        </div>

        <div className="pb-20"></div>
      </div>
    </motion.div>
  );
}

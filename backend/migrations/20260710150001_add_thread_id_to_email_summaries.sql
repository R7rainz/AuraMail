-- +goose Up
-- +goose StatementBegin
ALTER TABLE email_summaries ADD COLUMN thread_id TEXT;
CREATE INDEX idx_summaries_thread_id ON email_summaries(thread_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_summaries_thread_id;
ALTER TABLE email_summaries DROP COLUMN thread_id;
-- +goose StatementEnd

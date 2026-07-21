-- +goose Up
-- +goose StatementBegin
ALTER TABLE email_summaries ADD COLUMN important BOOLEAN NOT NULL DEFAULT false;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE email_summaries DROP COLUMN important;
-- +goose StatementEnd

-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD COLUMN notifications_enabled BOOLEAN NOT NULL DEFAULT true;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP COLUMN notifications_enabled;
-- +goose StatementEnd

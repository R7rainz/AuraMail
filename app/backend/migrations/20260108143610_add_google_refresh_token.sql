-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD COLUMN google_refresh_token TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP COLUMN google_refresh_token;
-- +goose StatementEnd
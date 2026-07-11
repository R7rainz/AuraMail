#!/bin/sh
set -e

if [ -n "$GOOSE_DBSTRING" ]; then
	echo "Running database migrations..."
	./goose -dir ./migrations -env "" up
else
	echo "GOOSE_DBSTRING not set, skipping migrations"
fi

exec ./backend

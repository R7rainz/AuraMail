package ai

import (
	"encoding/json"
	"testing"
)

func TestAIResultUnmarshalAcceptsBulletSummary(t *testing.T) {
	var result AIResult
	if err := json.Unmarshal([]byte(`{"summary":["Role: Engineer","Location: Pune"]}`), &result); err != nil {
		t.Fatal(err)
	}
	if result.Summary != "• Role: Engineer\n• Location: Pune" {
		t.Fatalf("unexpected summary: %q", result.Summary)
	}
}

func TestAIResultUnmarshalAcceptsStringSummary(t *testing.T) {
	var result AIResult
	if err := json.Unmarshal([]byte(`{"summary":"A summary"}`), &result); err != nil {
		t.Fatal(err)
	}
	if result.Summary != "A summary" {
		t.Fatalf("unexpected summary: %q", result.Summary)
	}
}

package ai

import "testing"

func TestAIResult_Validate(t *testing.T) {
	n := "Acme"
	res := &AIResult{
		Category: "internship",
		Summary:  "This is a long enough summary for the validator to accept it.",
		Company:  &n,
	}
	if err := res.Validate(); err != nil {
		t.Fatal(err)
	}
}

func TestAIResult_Validate_ShortSummary(t *testing.T) {
	res := &AIResult{Category: "x", Summary: "short"}
	if err := res.Validate(); err == nil {
		t.Fatal("expected error")
	}
}

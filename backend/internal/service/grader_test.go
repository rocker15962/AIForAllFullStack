package service

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/anthropics/anthropic-sdk-go/v2/option"
)

func newTestGrader(t *testing.T, handler http.HandlerFunc) *ClaudeGrader {
	t.Helper()
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)
	return NewClaudeGrader("", option.WithBaseURL(srv.URL), option.WithAPIKey("test-key"), option.WithMaxRetries(0))
}

func messageResponse(text, stopReason string) string {
	body, _ := json.Marshal(map[string]any{
		"id":          "msg_test",
		"type":        "message",
		"role":        "assistant",
		"model":       DefaultGraderModel,
		"content":     []map[string]any{{"type": "text", "text": text}},
		"stop_reason": stopReason,
		"usage":       map[string]any{"input_tokens": 10, "output_tokens": 5},
	})
	return string(body)
}

func TestClaudeGrader_SendsStructuredRequestAndParsesVerdict(t *testing.T) {
	var got map[string]any
	var betaHeader string
	g := newTestGrader(t, func(w http.ResponseWriter, r *http.Request) {
		betaHeader = r.Header.Get("anthropic-beta")
		raw, _ := io.ReadAll(r.Body)
		_ = json.Unmarshal(raw, &got)
		w.Header().Set("Content-Type", "application/json")
		_, _ = io.WriteString(w, messageResponse(`{"correct": true}`, "end_turn"))
	})

	correct, err := g.Grade(context.Background(), GradeInput{
		Question:     "What is prompt engineering?",
		SampleAnswer: "Designing instructions so AI gives better output.",
		Answer:       "設計給 AI 的指令，讓輸出更好",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !correct {
		t.Fatal("expected correct verdict")
	}

	if got["model"] != DefaultGraderModel {
		t.Errorf("model = %v, want %s", got["model"], DefaultGraderModel)
	}
	if got["fallbacks"] != "default" {
		t.Errorf("fallbacks = %v, want \"default\"", got["fallbacks"])
	}
	if !strings.Contains(betaHeader, "server-side-fallback-2026-07-01") {
		t.Errorf("missing fallback beta header, got %q", betaHeader)
	}
	oc, _ := got["output_config"].(map[string]any)
	if oc["effort"] != "low" {
		t.Errorf("effort = %v, want low", oc["effort"])
	}
	format, _ := oc["format"].(map[string]any)
	if format["type"] != "json_schema" || format["schema"] == nil {
		t.Errorf("unexpected output format: %v", format)
	}
	msgs, _ := got["messages"].([]any)
	if len(msgs) != 1 || !strings.Contains(fmt.Sprint(msgs[0]), "<learner_answer>") {
		t.Errorf("learner answer not wrapped in tags: %v", msgs)
	}
}

func TestClaudeGrader_IncorrectVerdict(t *testing.T) {
	g := newTestGrader(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = io.WriteString(w, messageResponse(`{"correct": false}`, "end_turn"))
	})
	correct, err := g.Grade(context.Background(), GradeInput{Question: "q", SampleAnswer: "s", Answer: "a"})
	if err != nil || correct {
		t.Fatalf("got correct=%v err=%v, want false, nil", correct, err)
	}
}

func TestClaudeGrader_ErrorsOnRefusalAndBadResponses(t *testing.T) {
	cases := map[string]http.HandlerFunc{
		"refusal": func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			_, _ = io.WriteString(w, messageResponse("", "refusal"))
		},
		"not json": func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			_, _ = io.WriteString(w, messageResponse("yes", "end_turn"))
		},
		"server error": func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
			_, _ = io.WriteString(w, `{"type":"error","error":{"type":"api_error","message":"boom"}}`)
		},
	}
	for name, h := range cases {
		t.Run(name, func(t *testing.T) {
			g := newTestGrader(t, h)
			if _, err := g.Grade(context.Background(), GradeInput{Question: "q", SampleAnswer: "s", Answer: "a"}); err == nil {
				t.Fatal("expected an error")
			}
		})
	}
}

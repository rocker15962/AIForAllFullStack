package service

import (
	"encoding/json"
	"testing"

	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

func TestValidateAnswer_MultipleChoice_Correct(t *testing.T) {
	q := repository.Question{
		Type:          repository.QuestionTypeMultipleChoice,
		CorrectAnswer: "b",
	}
	if !validateAnswer(q, "b") {
		t.Error("expected correct for matching answer")
	}
}

func TestValidateAnswer_MultipleChoice_Incorrect(t *testing.T) {
	q := repository.Question{
		Type:          repository.QuestionTypeMultipleChoice,
		CorrectAnswer: "b",
	}
	if validateAnswer(q, "a") {
		t.Error("expected incorrect for non-matching answer")
	}
}

func TestValidateAnswer_ShortAnswer_KeywordMatch(t *testing.T) {
	keywords, _ := json.Marshal([]string{"machine learning", "ML"})
	q := repository.Question{
		Type:               repository.QuestionTypeShortAnswer,
		AcceptableKeywords: keywords,
	}
	if !validateAnswer(q, "I think it's about Machine Learning") {
		t.Error("expected correct for keyword match (case-insensitive)")
	}
}

func TestValidateAnswer_ShortAnswer_NoKeywordMatch(t *testing.T) {
	keywords, _ := json.Marshal([]string{"machine learning", "ML"})
	q := repository.Question{
		Type:               repository.QuestionTypeShortAnswer,
		AcceptableKeywords: keywords,
	}
	if validateAnswer(q, "I have no idea") {
		t.Error("expected incorrect for no keyword match")
	}
}

func TestValidateAnswer_ShortAnswer_NoKeywords_AnyNonEmpty(t *testing.T) {
	q := repository.Question{
		Type:               repository.QuestionTypeShortAnswer,
		AcceptableKeywords: nil,
	}
	if !validateAnswer(q, "any answer") {
		t.Error("expected correct for any non-empty answer when no keywords defined")
	}
	if validateAnswer(q, "") {
		t.Error("expected incorrect for empty answer")
	}
}

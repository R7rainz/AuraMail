package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	"golang.org/x/oauth2"

	"github.com/r7rainz/auramail/internal/user"
)

type Handler struct {
	oauthConfig *oauth2.Config
	userRepo    user.Repository
	service     *Service
}

type refreshRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type userResponse struct {
	ID                   string `json:"id"`
	Email                string `json:"email"`
	Name                 string `json:"name"`
	Image                string `json:"image,omitempty"`
	NotificationsEnabled bool   `json:"notificationsEnabled"`
}

type updateNotificationsRequest struct {
	Enabled bool `json:"enabled"`
}

func NewHandler(cfg *oauth2.Config, userRepo user.Repository) *Handler {
	return &Handler{
		oauthConfig: cfg,
		userRepo:    userRepo,
		service:     NewService(userRepo),
	}
}

// Me returns the current authenticated user
func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserIDContextKey).(string)
	if !ok {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "unauthorized",
		})
		return
	}

	foundUser, err := h.userRepo.FindByID(r.Context(), userID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "user not found",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"user": userResponse{
			ID:                   foundUser.ID,
			Email:                foundUser.Email,
			Name:                 foundUser.Name,
			NotificationsEnabled: foundUser.NotificationsEnabled,
		},
	})
}

// UpdateNotifications toggles the authenticated user's notification preference
func (h *Handler) UpdateNotifications(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserIDContextKey).(string)
	if !ok {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "unauthorized",
		})
		return
	}

	var req updateNotificationsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "invalid request format",
		})
		return
	}

	if err := h.userRepo.UpdateNotificationsEnabled(r.Context(), userID, req.Enabled); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "failed to update notification preference",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success":              true,
		"notificationsEnabled": req.Enabled,
	})
}

func (h *Handler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req refreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Printf("Refresh Error : Failed to decode JSON body: %v\n", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "invalid request format",
		})
		return
	}
	if req.RefreshToken == "" {
		fmt.Printf("Refresh Error : Frontend sent an empty refresh token")
	}

	accessToken, err := h.service.Refresh(r.Context(), req.RefreshToken)
	if err != nil {
		fmt.Printf("Refresh Error from service: %v\n", err)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "invalid refresh token",
		})
		return
	}

	fmt.Printf("Refresh success ! sending new access token")
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success":     true,
		"accessToken": accessToken,
	})
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserIDContextKey).(string)
	if !ok {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "unauthorized",
		})
		return
	}

	if err := h.service.Logout(r.Context(), userID); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "logout failed",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success": true,
	})
}

package google

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"

	"github.com/r7rainz/auramail/internal/auth"
	"github.com/r7rainz/auramail/internal/user"
	"golang.org/x/oauth2"
)

// Handler manages the Google OAuth HTTP endpoints
type Handler struct {
	oauthConfig  *oauth2.Config
	userRepo     user.Repository
	stateManager *StateManager
	frontendURL  string
}

// GoogleUser represents the JSON payload returned by Google's userinfo endpoint
type GoogleUser struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

// NewHandler creates a new Google OAuth handler
func NewHandler(cfg *oauth2.Config, userRepo user.Repository, frontendURL string) *Handler {
	return &Handler{
		oauthConfig:  cfg,
		userRepo:     userRepo,
		stateManager: NewStateManager(),
		frontendURL:  frontendURL,
	}
}

// GoogleAuth starts the OAuth flow by redirecting the user to Google's consent screen
func (h *Handler) GoogleAuth(w http.ResponseWriter, r *http.Request) {
	// 1. Generate a secure, random state string
	state, err := h.stateManager.Generate()
	if err != nil {
		slog.Error("failed to generate oauth state", "err", err)
		http.Error(w, "failed to start oauth flow", http.StatusInternalServerError)
		return
	}

	// 2. Build the Google Login URL
	authURL := h.oauthConfig.AuthCodeURL(
		state,
		oauth2.AccessTypeOffline, // Request a refresh token from Google
		oauth2.ApprovalForce,     // Force consent screen to ensure we get the refresh token
	)

	// 3. Send the user to Google
	http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
}

// GoogleCallback handles the response from Google after the user logs in
func (h *Handler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	// 1. Verify the state matches what we generated (prevents CSRF attacks)
	state := r.URL.Query().Get("state")
	if !h.stateManager.Validate(state) {
		http.Error(w, "invalid state", http.StatusBadRequest)
		return
	}

	// 2. Grab the authorization code Google sent back
	codeStr := r.URL.Query().Get("code")
	if codeStr == "" {
		http.Error(w, "missing code", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	// 3. Exchange the code for Google's tokens
	googleToken, err := h.oauthConfig.Exchange(ctx, codeStr)
	if err != nil {
		slog.Error("oauth exchange failed", "err", err)
		http.Error(w, "oauth exchange failed", http.StatusInternalServerError)
		return
	}

	// 4. Use Google's access token to fetch the user's profile info
	client := h.oauthConfig.Client(ctx, googleToken)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		slog.Error("userinfo request failed", "err", err)
		http.Error(w, "failed to fetch user info", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "invalid google response", http.StatusUnauthorized)
		return
	}

	// 5. Parse the user info
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "failed to read response", http.StatusInternalServerError)
		return
	}

	var googleUser GoogleUser
	if err := json.Unmarshal(body, &googleUser); err != nil {
		http.Error(w, "invalid google user payload", http.StatusInternalServerError)
		return
	}

	slog.Info("google user authenticated", "email", googleUser.Email, "sub", googleUser.Sub)

	// 6. Find or Create the user in our database
	u, err := h.userRepo.FindOrCreateGoogleUser(ctx, googleUser.Email, googleUser.Name, googleUser.Sub)
	if err != nil {
		slog.Error("failed to persist user", "err", err, "email", googleUser.Email)
		http.Error(w, "failed to persist user", http.StatusInternalServerError)
		return
	}

	// ==========================================
	// 7. TOKEN GENERATION & STORAGE (THE FIX!)
	// ==========================================

	// A. Generate YOUR App's JWTs
	appAccessToken, err := auth.GenerateAccessToken(u.ID, u.Email, u.Name)
	if err != nil {
		http.Error(w, "failed to generate access token", http.StatusInternalServerError)
		return
	}

	appRefreshToken, err := auth.GenerateRefreshToken(u.ID, u.Email)
	if err != nil {
		http.Error(w, "failed to generate refresh token", http.StatusInternalServerError)
		return
	}

	// B. Save YOUR App's Refresh Token to the database so sessions work
	if err := h.userRepo.UpdateRefreshToken(ctx, u.ID, appRefreshToken); err != nil {
		slog.Error("failed to save app refresh token", "err", err)
		http.Error(w, "failed to save session token", http.StatusInternalServerError)
		return
	}

	// C. Handle Google's Refresh Token (Requires a separate DB column!)
	if googleToken.RefreshToken != "" {
		slog.Info("Received new Google Refresh Token. Saving to google_refresh_token column.")
		
		// UNCOMMENT THIS LINE:
		if err := h.userRepo.UpdateGoogleRefreshToken(ctx, u.ID, googleToken.RefreshToken); err != nil {
			slog.Error("failed to save google refresh token", "err", err)
		}
	} else {
		slog.Warn("no google refresh token received; using existing one")
	}

	// ==========================================

	// 8. Redirect the user back to the React frontend with YOUR app tokens
	redirectURL := fmt.Sprintf("%s/auth/callback?access_token=%s&refresh_token=%s",
		h.frontendURL,
		url.QueryEscape(appAccessToken),
		url.QueryEscape(appRefreshToken),
	)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}

// RegisterRoutes binds the handlers to the provided mux
func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/auth/google", h.GoogleAuth)
	mux.HandleFunc("/auth/google/callback", h.GoogleCallback)
}
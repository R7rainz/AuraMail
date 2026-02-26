package user

type User struct {
	ID           string
	Email        string
	Name         string
	Provider     string
	ProviderID   string
	RefreshToken string
}

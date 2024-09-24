package handlers

import (
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
)

func ResumeHandler(w http.ResponseWriter, r *http.Request) {
	component := templates.Resume()
	component.Render(r.Context(), w)
}

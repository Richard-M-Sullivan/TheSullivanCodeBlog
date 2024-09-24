package handlers

import (
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
)

func SupportHandler(w http.ResponseWriter, r *http.Request) {
	component := templates.Support()
	component.Render(r.Context(), w)
}

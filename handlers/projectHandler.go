package handlers

import (
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
)

func ProjectHandler(w http.ResponseWriter, r *http.Request) {
	component := templates.Project()
	component.Render(r.Context(), w)
}

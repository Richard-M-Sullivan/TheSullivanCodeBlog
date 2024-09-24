package handlers

import (
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
)

func BlogHandler(w http.ResponseWriter, r *http.Request) {
	component := templates.Blog()
	component.Render(r.Context(), w)
}

package handlers

import (
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
)

func NotesHandler(w http.ResponseWriter, r *http.Request) {
	component := templates.Note()
	component.Render(r.Context(), w)
}

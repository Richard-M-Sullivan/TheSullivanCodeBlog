package handlers

import (
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
)

func TutorialHandler(w http.ResponseWriter, r *http.Request) {
	component := templates.Tutorial()
	component.Render(r.Context(), w)
}

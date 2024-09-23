package handlers

import (
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
)

func IndexHandler(w http.ResponseWriter, r *http.Request) {
	component := templates.Index()
	component.Render(r.Context(), w)
}

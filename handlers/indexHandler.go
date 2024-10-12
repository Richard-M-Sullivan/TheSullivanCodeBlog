package handlers

import (
	"fmt"
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
)

func IndexHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("%s", r.URL.Path)
	component := templates.Index()
	component.Render(r.Context(), w)
}

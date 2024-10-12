package handlers

import (
	"fmt"
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
)

func ProjectHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("projectHandler", r.URL.Path)
	component := templates.Project()
	component.Render(r.Context(), w)
}

func TitleHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("chaptersHandler", r.URL.Path)
	component := templates.ComputerProjectTitle()
	component.Render(r.Context(), w)
}

func ChaptersHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("chaptersHandler", r.URL.Path)
	component := templates.ComputerProjectChapters()
	component.Render(r.Context(), w)
}

func ProjectHandlers() *http.ServeMux {
	mux := http.NewServeMux()
	mux.Handle("/", http.HandlerFunc(ProjectHandler))
	mux.Handle("/title/{project}", http.HandlerFunc(TitleHandler))
	mux.Handle("/chapters/{project}", http.HandlerFunc(ChaptersHandler))
	return mux
}

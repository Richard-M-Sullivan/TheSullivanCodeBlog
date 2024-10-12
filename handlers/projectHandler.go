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

func ClosedHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("closed handler", r.URL.Path)
	component := templates.ComputerProjectClosed()
	component.Render(r.Context(), w)
}

func OpenHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("open handler", r.URL.Path)
	component := templates.ComputerProjectOpen()
	component.Render(r.Context(), w)
}

func ProjectHandlers() *http.ServeMux {
	mux := http.NewServeMux()
	mux.Handle("/", http.HandlerFunc(ProjectHandler))
	mux.Handle("/closed/{project}", http.HandlerFunc(ClosedHandler))
	mux.Handle("/open/{project}", http.HandlerFunc(OpenHandler))
	return mux
}

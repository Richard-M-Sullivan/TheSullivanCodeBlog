package handlers

import (
	"fmt"
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates/notes/c"
	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates/notes/golang"
	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates/notes/python"
	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates/notes/useful_links"
	"github.com/a-h/templ"
)

func NotesHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("notesHandler", r.URL.Path)
	component := templates.Note()
	component.Render(r.Context(), w)
}

func NotesClosedHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("closed handler", r.URL.Path)

	var component templ.Component

	note := r.PathValue("project")
	fmt.Println(note)

	switch note {
	case "c":
		component = templates.NotesClosedC()
	case "golang":
		component = templates.NotesClosedGoLang()
	case "python":
		component = templates.NotesClosedPython()
	case "useful-links":
		component = templates.NotesClosedUsefulLinks()
	}

	component.Render(r.Context(), w)
}

func NotesOpenHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("open handler", r.URL.Path)

	var component templ.Component

	note := r.PathValue("project")
	fmt.Println(note)

	switch note {
	case "c":
		component = templates.NotesOpenC()
	case "golang":
		component = templates.NotesOpenGoLang()
	case "python":
		component = templates.NotesOpenPython()
	case "useful-links":
		component = templates.NotesOpenUsefulLinks()
	}

	component.Render(r.Context(), w)
}

func NotesC(w http.ResponseWriter, r *http.Request) {
	fmt.Println("C notes", r.URL.Path)

	var component templ.Component

	chapter := r.PathValue("chapter")
	fmt.Println(chapter)

	switch chapter {
	case "introduction":
		component = c.Introduction()
	}

	component.Render(r.Context(), w)
}

func NotesGoLang(w http.ResponseWriter, r *http.Request) {
	fmt.Println("C notes", r.URL.Path)

	var component templ.Component

	chapter := r.PathValue("chapter")
	fmt.Println(chapter)

	switch chapter {
	case "introduction":
		component = golang.Introduction()
	}

	component.Render(r.Context(), w)
}

func NotesPython(w http.ResponseWriter, r *http.Request) {
	fmt.Println("C notes", r.URL.Path)

	var component templ.Component

	chapter := r.PathValue("chapter")
	fmt.Println(chapter)

	switch chapter {
	case "introduction":
		component = python.Introduction()
	}

	component.Render(r.Context(), w)
}

func NotesUsefulLinks(w http.ResponseWriter, r *http.Request) {
	fmt.Println("C notes", r.URL.Path)

	var component templ.Component

	chapter := r.PathValue("chapter")
	fmt.Println(chapter)

	switch chapter {
	case "introduction":
		component = useful_links.Introduction()
	}

	component.Render(r.Context(), w)
}

func NotesHandlers() *http.ServeMux {
	mux := http.NewServeMux()
	mux.Handle("/", http.HandlerFunc(NotesHandler))
	mux.Handle("/closed/{project}", http.HandlerFunc(NotesClosedHandler))
	mux.Handle("/open/{project}", http.HandlerFunc(NotesOpenHandler))
	mux.Handle("/c/{chapter}", http.HandlerFunc(NotesC))
	mux.Handle("/golang/{chapter}", http.HandlerFunc(NotesGoLang))
	mux.Handle("/python/{chapter}", http.HandlerFunc(NotesPython))
	mux.Handle("/useful-links/{chapter}", http.HandlerFunc(NotesUsefulLinks))
	return mux
}

package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/handlers"
)

func main() {
	// mux to hold handlers
	mux := http.NewServeMux()

	// setting the route handlers
	mux.Handle("/", http.HandlerFunc(handlers.IndexHandler))
	mux.Handle("/blog/", http.HandlerFunc(handlers.BlogHandler))
	mux.Handle("/project/", http.StripPrefix("/project", handlers.ProjectHandlers()))
	mux.Handle("/tutorial/", http.HandlerFunc(handlers.TutorialHandler))
	mux.Handle("/note/", http.StripPrefix("/note", handlers.NotesHandlers()))
	mux.Handle("/resume/", http.HandlerFunc(handlers.ResumeHandler))
	mux.Handle("/support/", http.HandlerFunc(handlers.SupportHandler))

	// file server for static content
	cssDir := http.Dir("./styles/")
	cssFS := http.FileServer(cssDir)
	mux.Handle("/styles/", http.StripPrefix("/styles/", cssFS))

	mediaDir := http.Dir("./media/")
	mediaFS := http.FileServer(mediaDir)
	mux.Handle("/media/", http.StripPrefix("/media/", mediaFS))

	htmxDir := http.Dir("./htmx")
	htmxFS := http.FileServer(htmxDir)
	mux.Handle("/htmx/", http.StripPrefix("/htmx/", htmxFS))

	javascriptDir := http.Dir("./javascript")
	javascriptFS := http.FileServer(javascriptDir)
	mux.Handle("/javascript/", http.StripPrefix("/javascript/", javascriptFS))

	fmt.Println("starting server...")
	log.Fatal(
		http.ListenAndServe(":8080", mux))
}

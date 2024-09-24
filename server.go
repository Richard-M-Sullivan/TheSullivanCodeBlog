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
	mux.Handle("/blog", http.HandlerFunc(handlers.BlogHandler))
	mux.Handle("/project", http.HandlerFunc(handlers.ProjectHandler))
	mux.Handle("/tutorial", http.HandlerFunc(handlers.TutorialHandler))
	mux.Handle("/note", http.HandlerFunc(handlers.NotesHandler))
	mux.Handle("/resume", http.HandlerFunc(handlers.ResumeHandler))
	mux.Handle("/support", http.HandlerFunc(handlers.SupportHandler))

	// file server for static content
	cssDir := http.Dir("./styles/")
	cssFS := http.FileServer(cssDir)
	mux.Handle("/styles/", http.StripPrefix("/styles/", cssFS))

	fmt.Println("starting server...")
	log.Fatal(
		http.ListenAndServe(":8080", mux))
}

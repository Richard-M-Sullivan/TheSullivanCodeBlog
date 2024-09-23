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

	// file server for static content
	cssDir := http.Dir("./styles/")
	cssFS := http.FileServer(cssDir)
	mux.Handle("/styles/", http.StripPrefix("/styles/", cssFS))

	fmt.Println("starting server...")
	log.Fatal(
		http.ListenAndServe(":8080", mux))
}

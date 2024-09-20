package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
)

func main() {
	indexHandler := func(w http.ResponseWriter, r *http.Request) {
		component := templates.Index()
		component.Render(r.Context(), w)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", indexHandler)
	mux.Handle("/styles/", http.FileServer(http.Dir(".")))

	fmt.Println("starting server...")
	log.Fatal(
		http.ListenAndServe(":8080", mux))
}

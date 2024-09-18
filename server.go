package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
	"github.com/a-h/templ"
)

func main() {
	component := templates.Index()
	http.Handle("/", templ.Handler(component))

	fmt.Println("starting server...")
	log.Fatal(
		http.ListenAndServe(":8080", nil))
}

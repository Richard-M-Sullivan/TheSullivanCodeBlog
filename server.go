package main

import (
	"fmt"
	"log"
	"net/http"
)

type Page struct {
	Title string
	Body  []byte
}

func main() {
	fmt.Println("starting server...")
	log.Fatal(
		http.ListenAndServe(":8080", http.FileServer(http.Dir("/var/www/Richard-M-Sullivan.github.io"))))
}

package handlers

import (
	"fmt"
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates/projects/homebrew_computer"
	"github.com/a-h/templ"
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

func HomebrewComputer(w http.ResponseWriter, r *http.Request) {
	fmt.Println("homebrew computer", r.URL.Path)

	var component templ.Component

	chapter := r.PathValue("chapter")
	fmt.Println(chapter)

	switch chapter {
	case "introduction":
		component = homebrew_computer.Introduction()

	case "logic-gates":
		component = homebrew_computer.LogicGates()

	case "logisim":
		component = homebrew_computer.Logisim()

	case "chips":
		component = homebrew_computer.Chips()

	case "prototype":
		component = homebrew_computer.Prototype()

	case "final-design":
		component = homebrew_computer.FinalDesign()

	case "parts":
		component = homebrew_computer.Parts()

	case "final-assembly":
		component = homebrew_computer.FinalAssembly()

	case "next-steps":
		component = homebrew_computer.NextSteps()

	}

	component.Render(r.Context(), w)
}

func ProjectHandlers() *http.ServeMux {
	mux := http.NewServeMux()
	mux.Handle("/", http.HandlerFunc(ProjectHandler))
	mux.Handle("/closed/{project}", http.HandlerFunc(ClosedHandler))
	mux.Handle("/open/{project}", http.HandlerFunc(OpenHandler))
	mux.Handle("/homebrew-computer/{chapter}", http.HandlerFunc(HomebrewComputer))
	return mux
}

package handlers

import (
	"net/http"

	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates"
	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates/projects/homebrew_computer"
	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates/projects/js_practice"
	"github.com/Richard-M-Sullivan/TheSullivanCodeBlog/templates/projects/sudoku_solver"
	"github.com/a-h/templ"
)

func ProjectHandler(w http.ResponseWriter, r *http.Request) {
	component := templates.Project()
	component.Render(r.Context(), w)
}

func ClosedHandler(w http.ResponseWriter, r *http.Request) {

	var component templ.Component

	project := r.PathValue("project")

	switch project {
	case "computer":
        component = templates.ComputerProjectClosed()

	case "js-practice":
		component = templates.JSPracticeClosed()

	case "sudoku-solver":
		component = templates.SudokuSolverClosed()

	}

	component.Render(r.Context(), w)
}

func OpenHandler(w http.ResponseWriter, r *http.Request) {
	var component templ.Component

	project := r.PathValue("project")

	switch project {
	case "computer":
        component = templates.ComputerProjectOpen()

	case "js-practice":
		component = templates.JSPracticeOpen()

	case "sudoku-solver":
		component = templates.SudokuSolverOpen()

	}

	component.Render(r.Context(), w)
}

func HomebrewComputer(w http.ResponseWriter, r *http.Request) {
	var component templ.Component

	chapter := r.PathValue("chapter")

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

func JSPractice(w http.ResponseWriter, r *http.Request) {
	var component templ.Component

	chapter := r.PathValue("chapter")

	switch chapter {
	case "fetch-box":
		component = js_practice.FetchBox()

	}

	component.Render(r.Context(), w)
}

func SudokuSolver(w http.ResponseWriter, r *http.Request) {
	var component templ.Component

	chapter := r.PathValue("chapter")

	switch chapter {
	case "sudoku-solver":
		component = sudoku_solver.SudokuSolver()

	}

	component.Render(r.Context(), w)
}

func ProjectHandlers() *http.ServeMux {
	mux := http.NewServeMux()
	mux.Handle("/", http.HandlerFunc(ProjectHandler))
	mux.Handle("/closed/{project}", http.HandlerFunc(ClosedHandler))
	mux.Handle("/open/{project}", http.HandlerFunc(OpenHandler))
	mux.Handle("/homebrew-computer/{chapter}", http.HandlerFunc(HomebrewComputer))
	mux.Handle("/js-practice/{chapter}", http.HandlerFunc(JSPractice))
	mux.Handle("/sudoku-solver/{chapter}", http.HandlerFunc(SudokuSolver))
	return mux
}

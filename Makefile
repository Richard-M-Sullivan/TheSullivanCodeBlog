.PHONY: run

run:
	@templ generate
	@tailwindcss -i ./input.css -o ./styles/output.css
	@go run server.go

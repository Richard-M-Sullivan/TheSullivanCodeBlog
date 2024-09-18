.PHONY: run

run:
	@ templ generate
	@ go run server.go

package main

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
)

func main() {
	// Get the current directory to serve static files
	currentDir, err := filepath.Abs(".")
	if err != nil {
		log.Fatal("Error getting current directory:", err)
	}

	// Create a file server handler for static files
	fileServer := http.FileServer(http.Dir(currentDir))

	// Handle all requests with the file server
	http.Handle("/", fileServer)

	// Set the port
	port := ":8080"
	
	fmt.Printf("Starting server on http://localhost%s\n", port)
	fmt.Printf("Serving files from: %s\n", currentDir)
	fmt.Println("Press Ctrl+C to stop the server")

	// Start the server
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

package main

import (
	"fmt"
	"net/http"
)

func ratings(w http.ResponseWriter, req *http.Request) {
	fmt.Println("received /ratings request")
}

func main() {
	http.HandleFunc("/ratings", ratings)

	fmt.Println("server is up and listening on port 8090")
	http.ListenAndServe(":8090", nil)
}

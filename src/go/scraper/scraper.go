package main

import (
	"fmt"
	"net/http"

	"github.com/op/go-logging"
)

var logger = logging.MustGetLogger("scraper")

// ratings route implementation
func ratings(w http.ResponseWriter, req *http.Request) {
	if req.Method != "GET" {
		http.Error(w, "Method is not supported", http.StatusNotFound)
		return
	}

	logger.Debug("received /ratings request")
	fmt.Fprintf(w, "hello :)")
}

func main() {
	// Setup logger
	format := logging.MustStringFormatter(`%{level}: %{shortfile}.%{shortfunc} - %{message}`)
	logging.SetFormatter(format)
	logging.SetLevel(logging.DEBUG, "scraper")

	// Setup route
	http.HandleFunc("/ratings", ratings)

	// Setup listen and serve
	logger.Info("starting server on port 8090")
	if err := http.ListenAndServe(":8090", nil); err != nil {
		logger.Critical(err)
	}
}

package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
)

// Message which will contain environment variables
type Environment struct {
	port              string
	ratingsUri        string
	ratingsHistoryUri string
	tickerUri         string
}

// Error message to return if an error occurred during response building
type Error struct {
	Error string `json:"error"`
}

// Get the desired environment variables
func getEnv() (Environment, error) {
	var env Environment
	port := os.Getenv("REALTIME_SERVER_PORT")
	ratingsUri := os.Getenv("RATINGS_SERVICE_URI")
	ratingsHistoryUri := os.Getenv("RATINGS_HISTORY_SERVICE_URI")
	tickerUri := os.Getenv("TICKER_SERVICE_URI")

	// Check if REALTIME_SERVER_PORT is valid
	if len(port) == 0 {
		return env, errors.New("no value provided for environment variable REALTIME_SERVER_PORT")
	}
	env.port = port

	// Check if RATINGS_SERVICE_URI is valid
	if len(ratingsUri) == 0 {
		return env, errors.New("no value provided for environment variable RATINGS_SERVICE_URI")
	}
	env.ratingsUri = ratingsUri

	// Check if RATINGS_HISTORY_SERVICE_URI is valid
	if len(ratingsHistoryUri) == 0 {
		return env, errors.New("no value provided for environment variable RATINGS_HISTORY_SERVICE_URI")
	}
	env.ratingsHistoryUri = ratingsHistoryUri

	// Check if TICKER_SERVICE_URI is valid
	if len(tickerUri) == 0 {
		return env, errors.New("no value provided for environment variable TICKER_SERVICE_URI")
	}
	env.tickerUri = tickerUri

	return env, nil
}

// Handle realtime GET request
func handleGETRequest(symbol string) []byte {
	log.Println("received realtime request for " + symbol + ", retrieving data")
	var response []byte
	return response
}

// Main handler. Setup and configure HTTP server
func main() {
	env, err := getEnv()
	if err != nil {
		log.Println(err)
		log.Println("exiting...")
		return
	}

	log.Println("setting up and starting realtime server on port " + env.port)
	http.HandleFunc("/realtime", realtime)
	http.ListenAndServe(":"+env.port, nil)
}

// Marshal error response with some logging
func marshalErrorResponse(msg string) []byte {
	log.Println(msg)
	msgObj := &Error{Error: msg}
	bytes, _ := json.Marshal(msgObj)
	return bytes
}

// Realtime HTTP route
func realtime(w http.ResponseWriter, req *http.Request) {
	if req.Method != "GET" {
		resMsg := "unsupported method received (" + req.Method + "), ignoring request"
		res := marshalErrorResponse(resMsg)
		w.Write(res)
		return
	}

	keys, ok := req.URL.Query()["symbol"]
	if !ok || len(keys[0]) < 1 {
		resMsg := "received realtime request with no symbol parameter, ignoring request"
		res := marshalErrorResponse(resMsg)
		w.Write(res)
		return
	}

	symbol := keys[0]
	if req.Method == "GET" {
		res := handleGETRequest(symbol)
		w.Write(res)
		return
	}
}

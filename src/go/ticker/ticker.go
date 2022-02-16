package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/piquette/finance-go/quote"
)

// Message which will contain environment variables
type Environment struct {
	port string
}

// Error message to return if an error occurred during response building
type Error struct {
	Error string `json:"error"`
}

// Response message to respond with for ticker GET requests
type Ticker struct {
	CompanyName string  `json:"companyName"`
	Price       float64 `json:"price"`
	Symbol      string  `json:"symbol"`
}

// Get the desired environment variables
func getEnv() (Environment, error) {
	var env Environment
	port := os.Getenv("TICKER_SERVER_PORT")

	// Check if TICKER_SERVER_PORT is valid
	if len(port) == 0 {
		return env, errors.New("no value provided for environment variable TICKER_SERVER_PORT")
	}
	env.port = port

	return env, nil
}

// Handle ticker GET request
func handleGETRequest(symbol string) []byte {
	log.Println("received ticker request for " + symbol + ", retrieving quote")

	quote, err := quote.Get(symbol)
	if err != nil {
		return marshalErrorResponse("error occurred retrieving quote data for " + symbol + ": " + err.Error())
	}

	if quote == nil {
		return marshalErrorResponse("no data provided for " + symbol + ", invalid symbol provided")
	}

	res := marshalGETResponse(quote.ShortName, quote.RegularMarketPrice, quote.Symbol)
	log.Println("responding with retrieved quote for " + symbol)
	return res
}

// Main handler. Setup and configure HTTP server
func main() {
	env, err := getEnv()
	if err != nil {
		log.Println(err)
		log.Println("exiting...")
		return
	}

	log.Println("setting up and starting ticker server on port " + env.port)
	http.HandleFunc("/ticker", ticker)
	http.ListenAndServe(":"+env.port, nil)
}

// Marshal error response with some logging
func marshalErrorResponse(msg string) []byte {
	log.Println(msg)
	msgObj := &Error{Error: msg}
	bytes, _ := json.Marshal(msgObj)
	return bytes
}

// Marshal ticker GET response with some logging
func marshalGETResponse(name string, price float64, symbol string) []byte {
	log.Println("marshalling GET response for ticker request " + symbol)
	msgObj := &Ticker{CompanyName: name, Price: price, Symbol: symbol}
	bytes, _ := json.Marshal(msgObj)
	return bytes
}

// Ticker HTTP route
func ticker(w http.ResponseWriter, req *http.Request) {
	if req.Method != "GET" {
		res := marshalErrorResponse("unsupported method received (" + req.Method + "), ignoring request")
		w.Write(res)
		return
	}

	keys, ok := req.URL.Query()["symbol"]
	if !ok || len(keys[0]) < 1 {
		res := marshalErrorResponse("received ticker request with no symbol parameter, ignoring request")
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

package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/piquette/finance-go/quote"
)

// Error message to return if an error occurred during response building
type Error struct {
	Error string `json:"error"`
}

// Response message to respond with for ticker requests
type TickerResponse struct {
	CompanyName string  `json:"companyName"`
	Price       float64 `json:"price"`
	Symbol      string  `json:"symbol"`
}

// Main handler. Setup and configure HTTP server
func main() {
	port := os.Getenv("TICKER_SERVER_PORT")

	if len(port) == 0 {
		log.Println("no value provided for environment variable TICKER_SERVER_PORT, exiting...")
		return
	}

	log.Println("setting up and starting ticker server on port " + port)
	http.HandleFunc("/ticker", ticker)
	http.ListenAndServe(":"+port, nil)
}

// Marshal error response with some logging
func marshalErrorResponse(msg string) []byte {
	log.Println(msg)
	msgObj := &Error{Error: msg}
	bytes, _ := json.Marshal(msgObj)
	return bytes
}

// Marshal ticker response with some logging
func marshalTickerResponse(name string, price float64, symbol string) []byte {
	log.Println("marshalling response for ticker request " + symbol)
	msgObj := &TickerResponse{CompanyName: name, Price: price, Symbol: symbol}
	bytes, _ := json.Marshal(msgObj)
	return bytes
}

// Ticker HTTP route
func ticker(w http.ResponseWriter, req *http.Request) {
	if req.Method != "GET" {
		resMsg := "unsupported method received (" + req.Method + "), ignoring request"
		res := marshalErrorResponse(resMsg)
		w.Write(res)
		return
	}

	keys, ok := req.URL.Query()["symbol"]
	if !ok || len(keys[0]) < 1 {
		resMsg := "received ticker request with no symbol parameter, ignoring request"
		res := marshalErrorResponse(resMsg)
		w.Write(res)
		return
	}

	symbol := keys[0]
	log.Println("received ticker request for " + symbol + ", retrieving quote")

	quote, err := quote.Get(symbol)
	if err != nil {
		resMsg := "error occurred retrieving quote data for " + symbol + ": " + err.Error()
		res := marshalErrorResponse(resMsg)
		w.Write(res)
		return
	}

	if quote == nil {
		resMsg := "no data provided for " + symbol + ", invalid symbol provided"
		res := marshalErrorResponse(resMsg)
		w.Write(res)
		return
	}

	res := marshalTickerResponse(quote.ShortName, quote.RegularMarketPrice, quote.Symbol)
	log.Println("responding with retrieved quote for " + symbol)
	w.Write(res)
}

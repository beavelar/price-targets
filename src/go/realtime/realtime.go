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

// Rating message received from ratings and ratings_history services GET request
// TODO: Figure out how to make a common dir for this struct
type Rating struct {
	Average float64 `json:"average"`
	Highest float64 `json:"highest"`
	Lowest  float64 `json:"lowest"`
}

// Realtime message to repond with for GET requests
type Realtime struct {
	Rating        Rating `json:"rating"`
	RatingHistory Rating `json:"rating_history"`
	Ticker        Ticker `json:"ticker"`
}

// Ticker message received from ticker service GET request
// TODO: Figure out how to make a common dir for this struct
type Ticker struct {
	CompanyName string  `json:"companyName"`
	Price       float64 `json:"price"`
	Symbol      string  `json:"symbol"`
}

var myEnv Environment

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
	symbolParam := "?symbol=" + symbol

	var rating Rating
	ratingsRes, err := http.Get(myEnv.ratingsUri + "/" + symbol)
	if err != nil {
		return marshalErrorResponse("error occured requesting data from ratings service: " + err.Error())
	}

	if err = json.NewDecoder(ratingsRes.Body).Decode(&rating); err != nil {
		return marshalErrorResponse("error occured decoding response from ratings service: " + err.Error())
	}

	var ratingHistory Rating
	ratingsHistoryRes, err := http.Get(myEnv.ratingsHistoryUri + symbolParam)
	if err != nil {
		return marshalErrorResponse("error occured requesting data from ratings_history service: " + err.Error())
	}

	if err = json.NewDecoder(ratingsHistoryRes.Body).Decode(&ratingHistory); err != nil {
		return marshalErrorResponse("error occured decoding response from ratings_history service: " + err.Error())
	}

	var ticker Ticker
	tickerRes, err := http.Get(myEnv.tickerUri + symbolParam)
	if err != nil {
		return marshalErrorResponse("error occured requesting data from ticker service: " + err.Error())
	}

	if err = json.NewDecoder(tickerRes.Body).Decode(&ticker); err != nil {
		return marshalErrorResponse("error occured decoding response from ticker service: " + err.Error())
	}

	return marshalGETResponse(rating, ratingHistory, symbol, ticker)
}

// Main handler. Setup and configure HTTP server
func main() {
	env, err := getEnv()
	if err != nil {
		log.Println(err)
		log.Println("exiting...")
		return
	}
	myEnv = env

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

// Marshal realtime GET response with some logging
func marshalGETResponse(rating Rating, ratingHistory Rating, symbol string, ticker Ticker) []byte {
	log.Println("marshalling GET response for realtime request " + symbol)
	msgObj := &Realtime{Rating: rating, RatingHistory: ratingHistory, Ticker: ticker}
	bytes, _ := json.Marshal(msgObj)
	return bytes
}

// Realtime HTTP route
func realtime(w http.ResponseWriter, req *http.Request) {
	if req.Method != "GET" {
		res := marshalErrorResponse("unsupported method received (" + req.Method + "), ignoring request")
		w.Write(res)
		return
	}

	keys, ok := req.URL.Query()["symbol"]
	if !ok || len(keys[0]) < 1 {
		res := marshalErrorResponse("unsupported method received (" + req.Method + "), ignoring request")
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

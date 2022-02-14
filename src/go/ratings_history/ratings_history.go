package main

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DBWrapper struct {
	client     *mongo.Client
	collection *mongo.Collection
}

// Message which will contain environment variables
type Environment struct {
	dbCollectionName   string
	dbConnectTimeout   time.Duration
	dbName             string
	dbUri              string
	ratingsHistoryPort string
}

// Error message to return if an error occurred during response building
type Error struct {
	Error string `json:"error"`
}

// Response message to respond with for ratings history GET requests
type GETResponse struct {
	Average float64 `json:"average", bson:"average"`
	Highest float64 `json:"highest", bson:"highest"`
	Lowest  float64 `json:"lowest", bson:"lowest"`
}

// Request message for valid incoming POST requests
type PostRequest struct {
	Average float64 `json:"average"`
	Highest float64 `json:"highest"`
	Lowest  float64 `json:"lowest"`
}

// Response message to respond with for ratings history POST requests
type POSTResponse struct {
	Result string `json:"result"`
}

// Global service
var dbWrapper DBWrapper

// Create the db wrapper
func createDBWrapper(collection string, name string, timeout time.Duration, uri string) (DBWrapper, error) {
	var wrapper DBWrapper
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	log.Println("Connecting to database: " + uri)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return wrapper, errors.New("unable to connection to database")
	}
	wrapper.client = client
	wrapper.collection = client.Database(name).Collection(collection)

	return wrapper, nil
}

// Get the desired environment variables
func getEnv() (Environment, error) {
	var env Environment
	collectionName := os.Getenv("DATABASE_COLLECTION_NAME")
	timeout := os.Getenv("DATABASE_CONNECT_TIMEOUT")
	dbName := os.Getenv("DATABASE_NAME")
	dbUri := os.Getenv("DATABASE_URI")
	port := os.Getenv("RATINGS_HISTORY_SERVER_PORT")

	// Check if DATABASE_COLLECTION_NAME is valid
	if len(collectionName) == 0 {
		return env, errors.New("no value provided for environment variable DATABASE_COLLECTION_NAME")
	}
	env.dbCollectionName = collectionName

	// Check if DATABASE_CONNECT_TIMEOUT is valid
	if len(timeout) == 0 {
		return env, errors.New("no value provided for environment variable DATABASE_CONNECT_TIMEOUT")
	}
	duration, err := time.ParseDuration(timeout + "s")
	if err != nil {
		return env, errors.New("invalid value provided for environment variable DATABASE_CONNECT_TIMEOUT " + timeout)
	}
	env.dbConnectTimeout = duration

	// Check if DATABASE_NAME is valid
	if len(dbName) == 0 {
		return env, errors.New("no value provided for environment variable DATABASE_NAME")
	}
	env.dbName = dbName

	// Check if DATABASE_URI is valid
	if len(dbUri) == 0 {
		return env, errors.New("no value provided for environment variable DATABASE_URI")
	}
	env.dbUri = dbUri

	// Check if RATINGS_HISTORY_SERVER_PORT is valid
	if len(port) == 0 {
		return env, errors.New("no value provided for environment variable RATINGS_HISTORY_SERVER_PORT")
	}
	env.ratingsHistoryPort = port

	return env, nil
}

// Handle ticker GET request
func handleGETRequest(symbol string) []byte {
	var result GETResponse
	cursor, err := dbWrapper.collection.Find(context.Background(), bson.D{})
	if err != nil {
		res := marshalErrorResponse("unable to query ratings_history collection for " + symbol)
		return res
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		err := cursor.Decode(&result)
		if err != nil {
			log.Fatal(err)
		}
	}

	if err := cursor.Err(); err != nil {
		res := marshalErrorResponse("unable to decode ratings_history query for " + symbol)
		return res
	}

	res := marshalGETResponse(result.Average, result.Highest, result.Lowest, symbol)
	return res
}

// Handle ticker POST request
func handlePOSTRequest(body io.ReadCloser, symbol string) []byte {
	decoder := json.NewDecoder(body)
	var reqData GETResponse
	err := decoder.Decode(&reqData)

	if err != nil {
		resMsg := "unable to decode incoming body from POST request for " + symbol
		res := marshalErrorResponse(resMsg)
		return res
	}

	res := marshalPOSTResponse("some message", "AAPL")
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

	wrapper, err := createDBWrapper(env.dbCollectionName, env.dbName, env.dbConnectTimeout, env.dbUri)
	if err != nil {
		log.Println(err)
		log.Println("exiting...")
		return
	}
	dbWrapper = wrapper

	log.Println("setting up and starting ratings_history server on port " + env.ratingsHistoryPort)
	http.HandleFunc("/ratings_history", ratings_history)
	http.ListenAndServe(":"+env.ratingsHistoryPort, nil)
}

// Marshal error response with some logging
func marshalErrorResponse(msg string) []byte {
	log.Println(msg)
	msgObj := &Error{Error: msg}
	bytes, _ := json.Marshal(msgObj)
	return bytes
}

// Marshal ratings history POST response with some logging
func marshalPOSTResponse(msg string, symbol string) []byte {
	log.Println("marshalling POST response for ratings_history request " + symbol)
	msgObj := &POSTResponse{Result: msg}
	bytes, _ := json.Marshal(msgObj)
	return bytes
}

// Marshal ratings history GET response with some logging
func marshalGETResponse(average float64, highest float64, lowest float64, symbol string) []byte {
	log.Println("marshalling GET response for ratings_history request " + symbol)
	msgObj := &GETResponse{Average: average, Highest: highest, Lowest: lowest}
	bytes, _ := json.Marshal(msgObj)
	return bytes
}

// Ratings history HTTP route
func ratings_history(w http.ResponseWriter, req *http.Request) {
	if req.Method != "GET" && req.Method != "POST" {
		resMsg := "unsupported method received (" + req.Method + "), ignoring request"
		res := marshalErrorResponse(resMsg)
		w.Write(res)
		return
	}

	keys, ok := req.URL.Query()["symbol"]
	if !ok || len(keys[0]) < 1 {
		resMsg := "received ratings_history request with no symbol parameter, ignoring request"
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

	if req.Method == "POST" {
		res := handlePOSTRequest(req.Body, symbol)
		w.Write(res)
		return
	}
}

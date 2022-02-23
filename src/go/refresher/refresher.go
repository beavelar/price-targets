package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/robfig/cron/v3"
)

// Message which will contain environment variables
type Environment struct {
	botUri            string
	ratingsHistoryUri string
	realtimeUri       string
	symbols           []string
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

// Realtime message to to receive
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
	botUri := os.Getenv("BOT_SERVICE_URI")
	ratingsHistoryUri := os.Getenv("RATINGS_HISTORY_SERVICE_URI")
	realtimeUri := os.Getenv("REALTIME_SERVICE_URI")
	refresherSymbolsPath := os.Getenv("REFRESHER_SYMBOLS_PATH")

	// Check if BOT_SERVICE_URI is valid
	if len(botUri) == 0 {
		return env, errors.New("no value provided for environment variable BOT_SERVICE_URI")
	}
	env.botUri = botUri

	// Check if RATINGS_HISTORY_SERVICE_URI is valid
	if len(ratingsHistoryUri) == 0 {
		return env, errors.New("no value provided for environment variable RATINGS_HISTORY_SERVICE_URI")
	}
	env.ratingsHistoryUri = ratingsHistoryUri

	// Check if REALTIME_SERVICE_URI is valid
	if len(realtimeUri) == 0 {
		return env, errors.New("no value provided for environment variable REALTIME_SERVICE_URI")
	}
	env.realtimeUri = realtimeUri

	// Check if REFRESHER_SYMBOLS_PATH is valid
	if len(refresherSymbolsPath) == 0 {
		return env, errors.New("no value provided for environment variable REFRESHER_SYMBOLS_PATH")
	}

	rawContent, err := os.ReadFile(refresherSymbolsPath)
	if err != nil {
		return env, errors.New("error occurred attempting to read from symbols file: " + err.Error())
	}
	content := string(rawContent)
	lines := strings.Split(content, "\n")
	env.symbols = strings.Split(lines[1], ",")

	return env, nil
}

// Main handler. Setup and configure cron job
func main() {
	env, err := getEnv()
	if err != nil {
		log.Println(err)
		log.Println("exiting...")
		return
	}
	myEnv = env
	log.Println("setting up and starting refresher cron job")

	// Set local timezone to UTC
	utc := time.FixedZone("UTC", 0)
	time.Local = utc

	// Create and run job Mon-Fri at 7AM MST, 2PM UTC
	job := cron.New()
	job.AddFunc("0 14 * * 1-5", refresher)
	job.Run()
}

// Marshal rating message
func marshalRatingMsg(msg Rating) []byte {
	bytes, _ := json.Marshal(msg)
	return bytes
}

// Marshal realtime message
func marshalRealtimeMsg(msg Realtime) []byte {
	bytes, _ := json.Marshal(msg)
	return bytes
}

// Logic to run on each cron job run
func refresher() {
	log.Println("running refresher cron job")
	for _, symbol := range myEnv.symbols {
		symbolParam := "?symbol=" + symbol

		var realtime Realtime
		realtimeRes, err := http.Get(myEnv.realtimeUri + symbolParam)
		if err != nil {
			log.Println("error occured requesting data from realtime service: " + err.Error())
			return
		}

		if err = json.NewDecoder(realtimeRes.Body).Decode(&realtime); err != nil {
			log.Println("error occured decoding response from ticker service: " + err.Error())
			return
		}

		if realtime.Rating.Average == realtime.RatingHistory.Average && realtime.Rating.Highest == realtime.RatingHistory.Highest && realtime.Rating.Lowest == realtime.RatingHistory.Lowest {
			log.Println("no difference between current and previous ratings for " + symbol)
			return
		}

		realtimeMsg := marshalRealtimeMsg(realtime)
		_, err = http.Post(myEnv.realtimeUri+symbolParam, "application/json", bytes.NewBuffer(realtimeMsg))

		if err != nil {
			log.Println("error occurred with POST request to bot server: " + err.Error())
			return
		}
		log.Println("successfully updated bot service with the update for " + symbol)

		historyMsg := marshalRatingMsg(realtime.RatingHistory)
		_, err = http.Post(myEnv.ratingsHistoryUri+symbolParam, "application/json", bytes.NewBuffer(historyMsg))

		if err != nil {
			log.Println("error occurred with POST request to ratings_history server: " + err.Error())
			return
		}
		log.Println("successfully updated ratings_history service with the update for " + symbol)
		time.Sleep(1 * time.Second)
	}
}

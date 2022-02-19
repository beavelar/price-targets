package main

import (
	"log"
	"time"

	"github.com/robfig/cron/v3"
)

// Main handler. Setup and configure cron job
func main() {
	// Set local timezone to UTC
	utc := time.FixedZone("UTC", 0)
	time.Local = utc

	// Create and run job Mon-Fri at 7AM MST, 2PM UTC
	job := cron.New()
	job.AddFunc("0 14 * * 1-5", func() { log.Println("hello world :)") })
	job.Run()
}

package main

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"io/ioutil"
	"log"
	"net/http"
)

// This is the response struct that will be
// serialized and sent back
type StatusResponse struct {
	Status string `json:"status"`
	User   string `json:"user"`
}

func UserGetHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	w.Header().Set("Content-Type", "application/json")

	body := StatusResponse{
		Status: "Hello world from mux!",
		User:   vars["user"],
	}

	serializedBody, _ := json.Marshal(body)
	_, _ = w.Write(serializedBody)
}

type RequestBody struct {
	Name string `json:"name"`
}

func UserPostHandler(w http.ResponseWriter, r *http.Request) {
	// Read complete request body
	rawRequestBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Transform into RequestBody struct
	requestBody := &RequestBody{}
	err = json.Unmarshal(rawRequestBody, requestBody)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	body := StatusResponse{
		Status: "Hello world from mux!",
		User:   requestBody.Name,
	}

	serializedBody, _ := json.Marshal(body)
	_, _ = w.Write(serializedBody)
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/users/{user}", UserGetHandler).Methods("GET")
	r.HandleFunc("/users", UserPostHandler).Methods("POST")

	log.Println("Listening on :8004")
	log.Fatal(http.ListenAndServe(":8004", r))
}

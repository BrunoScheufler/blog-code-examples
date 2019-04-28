package main

import (
	"github.com/labstack/echo"
	"net/http"
)

// This is the response struct that will be
// serialized and sent back
type StatusResponse struct {
	Status string `json:"status"`
	User   string `json:"user"`
}

// In addition to echo request handlers
// using a special context including
// all kinds of utilities, generated errors
// can be returned to handle them easily
func UserGetHandler(e echo.Context) error {
	// Create response object
	body := &StatusResponse{
		Status: "Hello world from echo!",
		User:   e.Param("user"),
	}

	// In this case we can return the JSON
	// function with our body as errors
	// thrown by this will be handled
	return e.JSON(http.StatusOK, body)
}

// This simple struct will be deserialized
// and processed in the request handler
type RequestBody struct {
	Name string `json:"name"`
}

func UserPostHandler(e echo.Context) error {
	// Similar to the gin implementation,
	// we start off by creating an
	// empty request body struct
	requestBody := &RequestBody{}

	// Bind body to the request body
	// struct and check for potential
	// errors
	err := e.Bind(requestBody)
	if err != nil {
		// If an error was created by the
		// Bind operation, we can utilize
		// echo's request handler structure
		// and simply return the error so
		// it gets handled accordingly
		return err
	}

	body := &StatusResponse{
		Status: "Hello world from echo!",
		User:   requestBody.Name,
	}

	return e.JSON(http.StatusOK, body)
}

func main() {
	// Create echo instance
	e := echo.New()

	// Add endpoint route for /users/<username>
	e.GET("/users/:user", UserGetHandler)

	// Add endpoint route for /users
	e.POST("/users", UserPostHandler)

	// Start echo and handle errors
	e.Logger.Fatal(e.Start(":8002"))
}

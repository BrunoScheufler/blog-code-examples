package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// This is the response struct that will be
// serialized and sent back
type StatusResponse struct {
	Status string `json:"status"`
	User   string `json:"user"`
}

func UserGetHandler(c *gin.Context) {
	// Create response object
	body := &StatusResponse{
		Status: "Hello world from gin!",
		User:   c.Param("user"),
	}

	// Send it off to the client
	c.JSON(http.StatusOK, body)
}

type RequestBody struct {
	Name string `json:"name"`
}

func UserPostHandler(c *gin.Context) {
	// Create empty request body
	// struct used to bind actual body into
	requestBody := &RequestBody{}

	// Bind JSON content of request body to
	// struct created above
	err := c.BindJSON(requestBody)
	if err != nil {
		// Gin automatically returns an error
		// response when the BindJSON operation
		// fails, we simply have to stop this
		// function from continuing to execute
		return
	}

	// Create response object
	body := &StatusResponse{
		Status: "Hello world from echo!",
		User:   requestBody.Name,
	}

	// And send it off to the requesting client
	c.JSON(http.StatusOK, body)
}

func main() {
	// Create gin router
	router := gin.Default()

	// Set up GET endpoint
	// for route  /users/<username>
	router.GET("/users/:user", UserGetHandler)

	// Set up POST endpoint for route /users/<usernane>
	router.POST("/users", UserPostHandler)

	// Launch Gin and
	// handle potential error
	err := router.Run(":8003")
	if err != nil {
		panic(err)
	}
}

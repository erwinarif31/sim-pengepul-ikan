package route

import (
	"github.com/erwinarif31/catchery-api/internal/delivery/http"
	"github.com/gofiber/fiber/v2"
)

type RouteConfig struct {

	App              *fiber.App

	BagangController *http.BagangController

	SalesController  *http.SalesController

	// AuthMiddleware    fiber.Handler

}



func (c *RouteConfig) Setup() {

	c.SetupGuestRoute()

	c.SetupAuthRoute()

}



func (c *RouteConfig) SetupGuestRoute() {

	// c.App.Post("/api/users", c.UserController.Register)

	// c.App.Post("/api/users/_login", c.UserController.Login)

	c.App.Post("/api/bagang", c.BagangController.Create)

	c.App.Get("/api/sales", c.SalesController.Search)

}

func (c *RouteConfig) SetupAuthRoute() {
}

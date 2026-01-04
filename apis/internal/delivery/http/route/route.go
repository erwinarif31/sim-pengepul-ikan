package route

import (
	"github.com/erwinarif31/catchery-api/internal/delivery/http"
	"github.com/gofiber/fiber/v2"
)

type RouteConfig struct {

	App                  *fiber.App

	BagangController     *http.BagangController

	SalesController      *http.SalesController

	MasterDataController *http.MasterDataController

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

	c.App.Get("/api/bagang", c.BagangController.Search)

	c.App.Get("/api/sales", c.SalesController.Search)



	c.App.Get("/api/harvest-types", c.MasterDataController.SearchHarvestTypes)

	c.App.Get("/api/production-cost-types", c.MasterDataController.SearchProductionCostTypes)

		c.App.Get("/api/workers", c.MasterDataController.SearchWorkers)

		c.App.Get("/api/seasons", c.MasterDataController.SearchSeasons)

		c.App.Post("/api/seasons/end", c.MasterDataController.EndSeason)

	}

func (c *RouteConfig) SetupAuthRoute() {
}

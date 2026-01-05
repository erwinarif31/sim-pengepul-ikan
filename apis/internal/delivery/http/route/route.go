package route

import (
	"github.com/erwinarif31/catchery-api/internal/delivery/http"
	"github.com/gofiber/fiber/v2"
)

type RouteConfig struct {

	App                      *fiber.App

	BagangController         *http.BagangController

	SalesController          *http.SalesController

	MasterDataController     *http.MasterDataController

	HarvestController        *http.HarvestController

	ProductionCostController *http.ProductionCostController

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

	c.App.Put("/api/bagang/:id", c.BagangController.Update)

	c.App.Delete("/api/bagang/:id", c.BagangController.Delete)

	c.App.Get("/api/bagang/:id", c.BagangController.FindById)

	c.App.Get("/api/bagang", c.BagangController.Search)

	c.App.Get("/api/sales", c.SalesController.Search)



	c.App.Get("/api/harvest-types", c.MasterDataController.SearchHarvestTypes)

	c.App.Post("/api/harvest-types", c.MasterDataController.CreateHarvestType)

	c.App.Delete("/api/harvest-types/:name", c.MasterDataController.DeleteHarvestType)



	c.App.Get("/api/production-cost-types", c.MasterDataController.SearchProductionCostTypes)

	c.App.Post("/api/production-cost-types", c.MasterDataController.CreateProductionCostType)

	c.App.Delete("/api/production-cost-types/:name", c.MasterDataController.DeleteProductionCostType)



	c.App.Get("/api/workers", c.MasterDataController.SearchWorkers)

	c.App.Post("/api/workers", c.MasterDataController.CreateWorker)

	c.App.Put("/api/workers/:id", c.MasterDataController.UpdateWorker)

	c.App.Delete("/api/workers/:id", c.MasterDataController.DeleteWorker)

	c.App.Get("/api/workers/:id", c.MasterDataController.FindWorkerById)



	c.App.Get("/api/seasons", c.MasterDataController.SearchSeasons)

	c.App.Post("/api/seasons/end", c.MasterDataController.EndSeason)



		c.App.Get("/api/bagang/:id/harvests", c.HarvestController.SearchByBagangId)



		c.App.Post("/api/harvests", c.HarvestController.Create)



		c.App.Put("/api/harvests/:id", c.HarvestController.Update)



		c.App.Delete("/api/harvests/:id", c.HarvestController.Delete)



	



		c.App.Get("/api/bagang/:id/production-costs", c.ProductionCostController.SearchByBagangId)



		c.App.Post("/api/production-costs", c.ProductionCostController.Create)



		c.App.Put("/api/production-costs/:id", c.ProductionCostController.Update)



		c.App.Delete("/api/production-costs/:id", c.ProductionCostController.Delete)



	}

func (c *RouteConfig) SetupAuthRoute() {
}

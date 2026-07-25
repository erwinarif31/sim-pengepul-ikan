package route

import (
	"github.com/erwinarif31/catchery-api/internal/delivery/http"
	"github.com/erwinarif31/catchery-api/internal/delivery/http/middleware"
	"github.com/gofiber/fiber/v2"
)

type RouteConfig struct {
	App *fiber.App

	BagangController *http.BagangController

	SalesController *http.SalesController

	MasterDataController *http.MasterDataController

	HarvestController *http.HarvestController

	ProductionCostController *http.ProductionCostController

	CustomerController *http.CustomerController

	PayrollController *http.PayrollController

	DashboardController *http.DashboardController

	StockController *http.StockController

	FinancialReportController *http.FinancialReportController

	UserController *http.UserController

	AuthMiddleware fiber.Handler
}

func (c *RouteConfig) Setup() {

	c.SetupGuestRoute()

	c.SetupAuthRoute()

}

func (c *RouteConfig) SetupGuestRoute() {
	c.App.Post("/api/users/login", c.UserController.Login)
}

func (c *RouteConfig) SetupAuthRoute() {
	api := c.App.Group("/api", c.AuthMiddleware)

	api.Get("/users/me", c.UserController.Current)
	api.Post("/users/logout", c.UserController.Logout)
	api.Put("/users/me", c.UserController.Update)

	api.Post("/bagang", c.BagangController.Create)
	api.Put("/bagang/:id", c.BagangController.Update)
	api.Delete("/bagang/:id", c.BagangController.Delete)
	api.Get("/bagang/:id", c.BagangController.FindById)
	api.Get("/bagang", c.BagangController.Search)

	api.Get("/sales", c.SalesController.Search)
	api.Post("/sales", c.SalesController.Create)
	api.Get("/sales/:id", c.SalesController.FindById)
	api.Post("/sales/:id/items", c.SalesController.AddSalesItem)
	api.Put("/sales/items/:id", c.SalesController.UpdateSalesItem)
	api.Delete("/sales/items/:id", c.SalesController.DeleteSalesItem)
	api.Post("/sales/:id/payments", c.SalesController.AddPayment)
	api.Put("/sales/payments/:id", c.SalesController.UpdatePayment)
	api.Delete("/sales/payments/:id", c.SalesController.DeletePayment)

	api.Get("/harvest-types", c.MasterDataController.SearchHarvestTypes)
	api.Post("/harvest-types", middleware.RequireRole("ADMIN"), c.MasterDataController.CreateHarvestType)
	api.Delete("/harvest-types/:name", middleware.RequireRole("ADMIN"), c.MasterDataController.DeleteHarvestType)
	api.Get("/production-cost-types", c.MasterDataController.SearchProductionCostTypes)
	api.Post("/production-cost-types", middleware.RequireRole("ADMIN"), c.MasterDataController.CreateProductionCostType)
	api.Delete("/production-cost-types/:name", middleware.RequireRole("ADMIN"), c.MasterDataController.DeleteProductionCostType)
	api.Get("/workers", c.MasterDataController.SearchWorkers)
	api.Post("/workers", middleware.RequireRole("ADMIN"), c.MasterDataController.CreateWorker)
	api.Put("/workers/:id", middleware.RequireRole("ADMIN"), c.MasterDataController.UpdateWorker)
	api.Delete("/workers/:id", middleware.RequireRole("ADMIN"), c.MasterDataController.DeleteWorker)
	api.Get("/workers/:id", c.MasterDataController.FindWorkerById)
	api.Get("/seasons", c.MasterDataController.SearchSeasons)
	api.Post("/seasons/end", middleware.RequireRole("ADMIN"), c.MasterDataController.EndSeason)

	api.Get("/bagang/:id/harvests", c.HarvestController.SearchByBagangId)
	api.Post("/harvests", c.HarvestController.Create)
	api.Put("/harvests/:id", c.HarvestController.Update)
	api.Delete("/harvests/:id", c.HarvestController.Delete)
	api.Get("/bagang/:id/production-costs", c.ProductionCostController.SearchByBagangId)
	api.Post("/production-costs", c.ProductionCostController.Create)
	api.Put("/production-costs/:id", c.ProductionCostController.Update)
	api.Delete("/production-costs/:id", c.ProductionCostController.Delete)

	api.Post("/customers", middleware.RequireRole("ADMIN"), c.CustomerController.Create)
	api.Put("/customers/:id", middleware.RequireRole("ADMIN"), c.CustomerController.Update)
	api.Delete("/customers/:id", middleware.RequireRole("ADMIN"), c.CustomerController.Delete)
	api.Get("/customers/:id", c.CustomerController.FindById)
	api.Get("/customers", c.CustomerController.Search)

	api.Get("/payroll/:workerId", c.PayrollController.GeneratePDF)
	api.Get("/dashboard/metrics", c.DashboardController.GetMetrics)
	api.Get("/dashboard/harvest-trend", c.DashboardController.GetHarvestTrend)
	api.Get("/dashboard/harvest-by-type", c.DashboardController.GetHarvestByType)
	api.Get("/dashboard/bagang-performance", c.DashboardController.GetBagangPerformance)
	api.Get("/dashboard/recent-sales", c.DashboardController.GetRecentSales)
	api.Get("/stock/summary", c.StockController.GetSummary)
	api.Get("/reports/financial", middleware.RequireRole("ADMIN", "OWNER"), c.FinancialReportController.GetReport)
}

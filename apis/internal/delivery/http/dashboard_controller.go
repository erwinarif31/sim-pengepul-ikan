package http

import (
	"strconv"

	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type DashboardController struct {
	Log              *logrus.Logger
	DashboardUseCase *usecase.DashboardUseCase
}

func NewDashboardController(
	log *logrus.Logger,
	dashboardUseCase *usecase.DashboardUseCase,
) *DashboardController {
	return &DashboardController{
		Log:              log,
		DashboardUseCase: dashboardUseCase,
	}
}

func (c *DashboardController) GetMetrics(ctx *fiber.Ctx) error {
	seasonID, err := strconv.Atoi(ctx.Query("seasonId"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "seasonId is required")
	}

	response, err := c.DashboardUseCase.GetMetrics(ctx.UserContext(), seasonID)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.DashboardMetricsResponse]{Data: response})
}

func (c *DashboardController) GetHarvestTrend(ctx *fiber.Ctx) error {
	seasonID, err := strconv.Atoi(ctx.Query("seasonId"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "seasonId is required")
	}

	response, err := c.DashboardUseCase.GetHarvestTrend(ctx.UserContext(), seasonID)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.HarvestTrendResponse]{Data: response})
}

func (c *DashboardController) GetHarvestByType(ctx *fiber.Ctx) error {
	seasonID, err := strconv.Atoi(ctx.Query("seasonId"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "seasonId is required")
	}

	response, err := c.DashboardUseCase.GetHarvestByType(ctx.UserContext(), seasonID)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.HarvestByTypeResponse]{Data: response})
}

func (c *DashboardController) GetBagangPerformance(ctx *fiber.Ctx) error {
	seasonID, err := strconv.Atoi(ctx.Query("seasonId"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "seasonId is required")
	}

	limit := 5 // default
	if limitStr := ctx.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	response, err := c.DashboardUseCase.GetBagangPerformance(ctx.UserContext(), seasonID, limit)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.BagangPerformanceResponse]{Data: response})
}

func (c *DashboardController) GetRecentSales(ctx *fiber.Ctx) error {
	limit := 5 // default
	if limitStr := ctx.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	response, err := c.DashboardUseCase.GetRecentSales(ctx.UserContext(), limit)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.RecentSalesResponse]{Data: response})
}

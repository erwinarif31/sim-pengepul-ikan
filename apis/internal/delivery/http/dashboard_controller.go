package http

import (
	"strconv"

	"github.com/erwinarif31/catchery-api/internal/delivery/http/middleware"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type DashboardController struct {
	Log              *logrus.Logger
	DashboardUseCase *usecase.DashboardUseCase
}

const maxDashboardLimit = 100

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
	if err != nil || seasonID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "seasonId is required")
	}

	response, err := c.DashboardUseCase.GetMetrics(ctx.UserContext(), middleware.GetUser(ctx), seasonID)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.DashboardMetricsResponse]{Data: response})
}

func (c *DashboardController) GetHarvestTrend(ctx *fiber.Ctx) error {
	seasonID, err := strconv.Atoi(ctx.Query("seasonId"))
	if err != nil || seasonID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "seasonId is required")
	}

	response, err := c.DashboardUseCase.GetHarvestTrend(ctx.UserContext(), middleware.GetUser(ctx), seasonID)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.HarvestTrendResponse]{Data: response})
}

func (c *DashboardController) GetHarvestByType(ctx *fiber.Ctx) error {
	seasonID, err := strconv.Atoi(ctx.Query("seasonId"))
	if err != nil || seasonID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "seasonId is required")
	}

	response, err := c.DashboardUseCase.GetHarvestByType(ctx.UserContext(), middleware.GetUser(ctx), seasonID)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.HarvestByTypeResponse]{Data: response})
}

func (c *DashboardController) GetBagangPerformance(ctx *fiber.Ctx) error {
	seasonID, err := strconv.Atoi(ctx.Query("seasonId"))
	if err != nil || seasonID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "seasonId is required")
	}

	limit := 5 // default
	if limitStr := ctx.Query("limit"); limitStr != "" {
		l, err := strconv.Atoi(limitStr)
		if err != nil || l < 1 || l > maxDashboardLimit {
			return fiber.NewError(fiber.StatusBadRequest, "limit must be between 1 and 100")
		}
		limit = l
	}

	response, err := c.DashboardUseCase.GetBagangPerformance(ctx.UserContext(), middleware.GetUser(ctx), seasonID, limit)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.BagangPerformanceResponse]{Data: response})
}

func (c *DashboardController) GetRecentSales(ctx *fiber.Ctx) error {
	seasonID, err := strconv.Atoi(ctx.Query("seasonId"))
	if err != nil || seasonID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "seasonId is required")
	}

	limit := 5 // default
	if limitStr := ctx.Query("limit"); limitStr != "" {
		l, err := strconv.Atoi(limitStr)
		if err != nil || l < 1 || l > maxDashboardLimit {
			return fiber.NewError(fiber.StatusBadRequest, "limit must be between 1 and 100")
		}
		limit = l
	}

	response, err := c.DashboardUseCase.GetRecentSales(ctx.UserContext(), middleware.GetUser(ctx), seasonID, limit)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.RecentSalesResponse]{Data: response})
}

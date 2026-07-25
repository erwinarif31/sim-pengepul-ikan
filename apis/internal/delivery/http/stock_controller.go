package http

import (
	"strconv"

	"github.com/erwinarif31/catchery-api/internal/delivery/http/middleware"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type StockController struct {
	Log          *logrus.Logger
	StockUseCase *usecase.StockUseCase
}

func NewStockController(log *logrus.Logger, stockUseCase *usecase.StockUseCase) *StockController {
	return &StockController{Log: log, StockUseCase: stockUseCase}
}

func (c *StockController) GetSummary(ctx *fiber.Ctx) error {
	seasonID, err := strconv.Atoi(ctx.Query("seasonId"))
	if err != nil || seasonID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "seasonId is required")
	}

	data, err := c.StockUseCase.Summary(
		ctx.UserContext(),
		middleware.GetUser(ctx),
		seasonID,
		ctx.Query("bagangId"),
		ctx.Query("harvestType"),
		ctx.Query("startDate"),
		ctx.Query("endDate"),
	)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[[]model.StockSummaryItem]{Data: data})
}

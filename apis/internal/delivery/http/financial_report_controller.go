package http

import (
	"strconv"

	"github.com/erwinarif31/catchery-api/internal/delivery/http/middleware"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type FinancialReportController struct {
	Log                    *logrus.Logger
	FinancialReportUseCase *usecase.FinancialReportUseCase
}

func NewFinancialReportController(log *logrus.Logger, financialReportUseCase *usecase.FinancialReportUseCase) *FinancialReportController {
	return &FinancialReportController{Log: log, FinancialReportUseCase: financialReportUseCase}
}

func (c *FinancialReportController) GetReport(ctx *fiber.Ctx) error {
	seasonID, err := strconv.Atoi(ctx.Query("seasonId"))
	if err != nil || seasonID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "seasonId is required")
	}

	response, err := c.FinancialReportUseCase.Generate(
		ctx.UserContext(),
		middleware.GetUser(ctx),
		seasonID,
		ctx.Query("bagangId"),
		ctx.Query("startDate"),
		ctx.Query("endDate"),
	)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.FinancialReportResponse]{Data: response})
}

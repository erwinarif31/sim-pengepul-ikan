package http

import (
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type PayrollController struct {
	Log            *logrus.Logger
	PayrollUseCase *usecase.PayrollUseCase
}

func NewPayrollController(
	log *logrus.Logger,
	payrollUseCase *usecase.PayrollUseCase,
) *PayrollController {
	return &PayrollController{
		Log:            log,
		PayrollUseCase: payrollUseCase,
	}
}

func (c *PayrollController) GeneratePDF(ctx *fiber.Ctx) error {
	workerID := ctx.Params("workerId")
	bagangID := ctx.Query("bagangId")
	pdfBytes, filename, err := c.PayrollUseCase.GeneratePayrollPDF(ctx.UserContext(), workerID, bagangID)
	if err != nil {
		return err
	}

	ctx.Set("Content-Type", "application/pdf")
	ctx.Set("Content-Disposition", "attachment; filename="+filename)
	return ctx.Send(pdfBytes)
}

package http

import (
	"github.com/erwinarif31/catchery-api/internal/delivery/http/middleware"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type ProductionCostController struct {
	Log                   *logrus.Logger
	ProductionCostUseCase *usecase.ProductionCostUseCase
}

func NewProductionCostController(
	log *logrus.Logger,
	productionCostUseCase *usecase.ProductionCostUseCase,
) *ProductionCostController {
	return &ProductionCostController{
		Log:                   log,
		ProductionCostUseCase: productionCostUseCase,
	}
}

func (c *ProductionCostController) SearchByBagangId(ctx *fiber.Ctx) error {
	bagangId := ctx.Params("id")
	auth := middleware.GetUser(ctx)
	responses, err := c.ProductionCostUseCase.SearchByBagangId(ctx.UserContext(), auth, bagangId)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[[]model.ProductionCostResponse]{Data: responses})
}

func (c *ProductionCostController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateProductionCostRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("error parsing request body")
		return fiber.ErrBadRequest
	}

	response, err := c.ProductionCostUseCase.Create(ctx.UserContext(), middleware.GetUser(ctx), request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.ProductionCostResponse]{Data: response})
}

func (c *ProductionCostController) Update(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	request := new(model.UpdateProductionCostRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("error parsing request body")
		return fiber.ErrBadRequest
	}

	response, err := c.ProductionCostUseCase.Update(ctx.UserContext(), middleware.GetUser(ctx), id, request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.ProductionCostResponse]{Data: response})
}

func (c *ProductionCostController) Delete(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if err := c.ProductionCostUseCase.Delete(ctx.UserContext(), middleware.GetUser(ctx), id); err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[bool]{Data: true})
}

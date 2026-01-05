package http

import (
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type HarvestController struct {
	Log            *logrus.Logger
	HarvestUseCase *usecase.HarvestUseCase
}

func NewHarvestController(
	log *logrus.Logger,
	harvestUseCase *usecase.HarvestUseCase,
) *HarvestController {
	return &HarvestController{
		Log:            log,
		HarvestUseCase: harvestUseCase,
	}
}

func (c *HarvestController) SearchByBagangId(ctx *fiber.Ctx) error {
	bagangId := ctx.Params("id")
	responses, err := c.HarvestUseCase.SearchByBagangId(ctx.UserContext(), bagangId)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[[]model.HarvestResponse]{Data: responses})
}

func (c *HarvestController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateHarvestRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("error parsing request body")
		return fiber.ErrBadRequest
	}

	response, err := c.HarvestUseCase.Create(ctx.UserContext(), request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.HarvestResponse]{Data: response})
}

func (c *HarvestController) Update(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	request := new(model.UpdateHarvestRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("error parsing request body")
		return fiber.ErrBadRequest
	}

	response, err := c.HarvestUseCase.Update(ctx.UserContext(), id, request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.HarvestResponse]{Data: response})
}

func (c *HarvestController) Delete(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if err := c.HarvestUseCase.Delete(ctx.UserContext(), id); err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[bool]{Data: true})
}

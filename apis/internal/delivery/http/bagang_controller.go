package http

import (
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type BagangController struct {
	BagangUseCase *usecase.BagangUseCase
	Log           *logrus.Logger
}

func NewBagangController(useCase *usecase.BagangUseCase, log *logrus.Logger) *BagangController {
	return &BagangController{
		BagangUseCase: useCase,
		Log:           log,
	}
}

func (c *BagangController) Create(ctx *fiber.Ctx) error {
	request := new(model.BagangCreateRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("error parsing request body")
		return fiber.ErrBadRequest
	}

	response, err := c.BagangUseCase.Create(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(model.WebResponse[*model.BagangResponse]{
		Data: response,
	})
}

func (c *BagangController) Update(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	request := new(model.BagangCreateRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("error parsing request body")
		return fiber.ErrBadRequest
	}

	response, err := c.BagangUseCase.Update(ctx.UserContext(), id, request)
	if err != nil {
		return err
	}

	return ctx.JSON(model.WebResponse[*model.BagangResponse]{
		Data: response,
	})
}

func (c *BagangController) Delete(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if err := c.BagangUseCase.Delete(ctx.UserContext(), id); err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[bool]{Data: true})
}

func (c *BagangController) FindById(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	response, err := c.BagangUseCase.FindById(ctx.UserContext(), id)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.BagangResponse]{Data: response})
}

func (c *BagangController) Search(ctx *fiber.Ctx) error {

	request := new(model.SearchBagangRequest)

	if err := ctx.QueryParser(request); err != nil {

		return fiber.ErrBadRequest

	}

	responses, err := c.BagangUseCase.Search(ctx.UserContext(), request)

	if err != nil {

		return err

	}

	return ctx.JSON(model.WebResponse[[]model.BagangResponse]{

		Data: responses,
	})

}

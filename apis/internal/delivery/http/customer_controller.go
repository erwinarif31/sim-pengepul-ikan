package http

import (
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type CustomerController struct {
	Log             *logrus.Logger
	CustomerUseCase *usecase.CustomerUseCase
}

func NewCustomerController(
	log *logrus.Logger,
	customerUseCase *usecase.CustomerUseCase,
) *CustomerController {
	return &CustomerController{
		Log:             log,
		CustomerUseCase: customerUseCase,
	}
}

func (c *CustomerController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateCustomerRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("error parsing request body")
		return fiber.ErrBadRequest
	}

	response, err := c.CustomerUseCase.Create(ctx.UserContext(), request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.CustomerResponse]{Data: response})
}

func (c *CustomerController) Update(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	request := new(model.UpdateCustomerRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("error parsing request body")
		return fiber.ErrBadRequest
	}

	response, err := c.CustomerUseCase.Update(ctx.UserContext(), id, request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.CustomerResponse]{Data: response})
}

func (c *CustomerController) Delete(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if err := c.CustomerUseCase.Delete(ctx.UserContext(), id); err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[bool]{Data: true})
}

func (c *CustomerController) FindById(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	response, err := c.CustomerUseCase.FindById(ctx.UserContext(), id)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.CustomerResponse]{Data: response})
}

func (c *CustomerController) Search(ctx *fiber.Ctx) error {
	request := new(model.SearchCustomerRequest)
	if err := ctx.QueryParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	responses, err := c.CustomerUseCase.Search(ctx.UserContext(), request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[[]model.CustomerResponse]{Data: responses})
}

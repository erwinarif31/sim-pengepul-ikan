package http

import (
	"github.com/erwinarif31/catchery-api/internal/delivery/http/middleware"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type SalesController struct {
	Log          *logrus.Logger
	SalesUseCase *usecase.SalesUseCase
}

func NewSalesController(
	log *logrus.Logger,
	salesUseCase *usecase.SalesUseCase,
) *SalesController {
	return &SalesController{
		Log:          log,
		SalesUseCase: salesUseCase,
	}
}

func (c *SalesController) Search(ctx *fiber.Ctx) error {
	request := new(model.SearchSalesRequest)
	if err := ctx.QueryParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	responses, err := c.SalesUseCase.Search(ctx.UserContext(), middleware.GetUser(ctx), request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[[]model.SalesResponse]{
		Data: responses,
	})
}

func (c *SalesController) FindById(ctx *fiber.Ctx) error {
	id, err := ctx.ParamsInt("id")
	if err != nil {
		return fiber.ErrBadRequest
	}
	response, err := c.SalesUseCase.FindById(ctx.UserContext(), middleware.GetUser(ctx), id)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.SalesResponse]{Data: response})
}

func (c *SalesController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateSalesRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}
	response, err := c.SalesUseCase.Create(ctx.UserContext(), middleware.GetUser(ctx), request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.SalesResponse]{Data: response})
}

func (c *SalesController) AddSalesItem(ctx *fiber.Ctx) error {
	id, err := ctx.ParamsInt("id")
	if err != nil {
		return fiber.ErrBadRequest
	}
	request := new(model.CreateSalesItemRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}
	response, err := c.SalesUseCase.AddSalesItem(ctx.UserContext(), middleware.GetUser(ctx), id, request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.SalesResponse]{Data: response})
}

func (c *SalesController) AddPayment(ctx *fiber.Ctx) error {
	id, err := ctx.ParamsInt("id")
	if err != nil {
		return fiber.ErrBadRequest
	}
	request := new(model.CreatePaymentRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}
	response, err := c.SalesUseCase.AddPayment(ctx.UserContext(), middleware.GetUser(ctx), id, request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.SalesResponse]{Data: response})
}

func (c *SalesController) UpdateSalesItem(ctx *fiber.Ctx) error {
	id, err := ctx.ParamsInt("id")
	if err != nil {
		return fiber.ErrBadRequest
	}
	request := new(model.CreateSalesItemRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}
	response, err := c.SalesUseCase.UpdateSalesItem(ctx.UserContext(), middleware.GetUser(ctx), id, request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.SalesResponse]{Data: response})
}

func (c *SalesController) DeleteSalesItem(ctx *fiber.Ctx) error {
	id, err := ctx.ParamsInt("id")
	if err != nil {
		return fiber.ErrBadRequest
	}
	response, err := c.SalesUseCase.DeleteSalesItem(ctx.UserContext(), middleware.GetUser(ctx), id)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.SalesResponse]{Data: response})
}

func (c *SalesController) UpdatePayment(ctx *fiber.Ctx) error {
	id, err := ctx.ParamsInt("id")
	if err != nil {
		return fiber.ErrBadRequest
	}
	request := new(model.CreatePaymentRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}
	response, err := c.SalesUseCase.UpdatePayment(ctx.UserContext(), middleware.GetUser(ctx), id, request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.SalesResponse]{Data: response})
}

func (c *SalesController) DeletePayment(ctx *fiber.Ctx) error {
	id, err := ctx.ParamsInt("id")
	if err != nil {
		return fiber.ErrBadRequest
	}
	response, err := c.SalesUseCase.DeletePayment(ctx.UserContext(), middleware.GetUser(ctx), id)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.SalesResponse]{Data: response})
}

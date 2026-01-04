package http

import (
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type BagangController struct {
	UseCase *usecase.BagangUseCase
	Log     *logrus.Logger
}

func NewBagangController(useCase *usecase.BagangUseCase, log *logrus.Logger) *BagangController {
	return &BagangController{
		UseCase: useCase,
		Log:     log,
	}
}

func (b *BagangController) Create(ctx *fiber.Ctx) error {
	request := new(model.BagangCreateRequest)
	if err := ctx.BodyParser(request); err != nil {
		b.Log.WithError(err).Error("error parsing request body")
		return fiber.ErrBadRequest
	}

	response, err := b.UseCase.Create(ctx.UserContext(), request)
	if err != nil {
		b.Log.WithError(err).Error("error creating bagang")
		return err
	}

	return ctx.JSON(model.WebResponse[*model.BagangResponse]{Data: response})
}

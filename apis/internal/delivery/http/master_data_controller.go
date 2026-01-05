package http

import (
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type MasterDataController struct {
	Log               *logrus.Logger
	MasterDataUseCase *usecase.MasterDataUseCase
}

func NewMasterDataController(
	log *logrus.Logger,
	masterDataUseCase *usecase.MasterDataUseCase,
) *MasterDataController {
	return &MasterDataController{
		Log:               log,
		MasterDataUseCase: masterDataUseCase,
	}
}

func (c *MasterDataController) SearchHarvestTypes(ctx *fiber.Ctx) error {
	responses, err := c.MasterDataUseCase.SearchHarvestTypes(ctx.UserContext())
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[[]model.HarvestTypeResponse]{Data: responses})
}

func (c *MasterDataController) CreateHarvestType(ctx *fiber.Ctx) error {
	request := new(model.CreateMasterDataRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("error parsing request body")
		return fiber.ErrBadRequest
	}

	response, err := c.MasterDataUseCase.CreateHarvestType(ctx.UserContext(), request)
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[*model.HarvestTypeResponse]{Data: response})
}

func (c *MasterDataController) DeleteHarvestType(ctx *fiber.Ctx) error {
	name := ctx.Params("name")
	if err := c.MasterDataUseCase.DeleteHarvestType(ctx.UserContext(), name); err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[bool]{Data: true})
}

func (c *MasterDataController) SearchProductionCostTypes(ctx *fiber.Ctx) error {
	responses, err := c.MasterDataUseCase.SearchProductionCostTypes(ctx.UserContext())
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[[]model.ProductionCostTypeResponse]{Data: responses})
}

func (c *MasterDataController) SearchWorkers(ctx *fiber.Ctx) error {
	responses, err := c.MasterDataUseCase.SearchWorkers(ctx.UserContext())
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[[]model.WorkerResponse]{Data: responses})
}

func (c *MasterDataController) SearchSeasons(ctx *fiber.Ctx) error {
	responses, err := c.MasterDataUseCase.SearchSeasons(ctx.UserContext())
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[[]model.SeasonResponse]{Data: responses})
}

func (c *MasterDataController) EndSeason(ctx *fiber.Ctx) error {
	if err := c.MasterDataUseCase.EndCurrentSeason(ctx.UserContext()); err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[string]{Data: "Success"})
}

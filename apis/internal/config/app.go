package config

import (
	"github.com/erwinarif31/catchery-api/internal/delivery/http"
	"github.com/erwinarif31/catchery-api/internal/delivery/http/route"
	"github.com/erwinarif31/catchery-api/internal/repository"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"gorm.io/gorm"
)

type BootstrapConfig struct {
	DB       *gorm.DB
	App      *fiber.App
	Log      *logrus.Logger
	Validate *validator.Validate
	Config   *viper.Viper
	// Producer *kafka.Producer
}

func Bootstrap(config *BootstrapConfig) {
	// setup repositories
	// userRepository := repository.NewUserRepository(config.Log)
	// contactRepository := repository.NewContactRepository(config.Log)
	// addressRepository := repository.NewAddressRepository(config.Log)
	bagangRepository := repository.NewBagangRepository(config.Log)
	salesRepository := repository.NewSalesRepository(config.Log)
	harvestTypeRepository := repository.NewHarvestTypeRepository(config.Log)
	productionCostTypeRepository := repository.NewProductionCostTypeRepository(config.Log)
	workerRepository := repository.NewWorkerRepository(config.Log)
	seasonRepository := repository.NewSeasonRepository(config.Log)
	harvestRepository := repository.NewHarvestRepository(config.Log)
	productionCostRepository := repository.NewProductionCostRepository(config.Log)
	salesDetailRepository := repository.NewSalesDetailRepository(config.Log)
	transactionDetailRepository := repository.NewTransactionDetailRepository(config.Log)
	customerRepository := repository.NewCustomerRepository(config.Log)

	// setup producer
	// var userProducer *messaging.UserProducer
	// var contactProducer *messaging.ContactProducer
	// var addressProducer *messaging.AddressProducer

	// if config.Producer != nil {
	// 	userProducer = messaging.NewUserProducer(config.Producer, config.Log)
	// 	contactProducer = messaging.NewContactProducer(config.Producer, config.Log)
	// 	addressProducer = messaging.NewAddressProducer(config.Producer, config.Log)
	// }

	// setup use cases
	// userUseCase := usecase.NewUserUseCase(config.DB, config.Log, config.Validate, userRepository, userProducer)
	// contactUseCase := usecase.NewContactUseCase(config.DB, config.Log, config.Validate, contactRepository, contactProducer)
	// addressUseCase := usecase.NewAddressUseCase(config.DB, config.Log, config.Validate, contactRepository, addressRepository, addressProducer)
	bagangUseCase := usecase.NewBagangUseCase(
		config.DB,
		config.Log,
		config.Validate,
		bagangRepository,
	)
	salesUseCase := usecase.NewSalesUseCase(
		config.DB,
		config.Log,
		config.Validate,
		salesRepository,
		salesDetailRepository,
		transactionDetailRepository,
	)
	masterDataUseCase := usecase.NewMasterDataUseCase(
		config.DB,
		config.Log,
		harvestTypeRepository,
		productionCostTypeRepository,
		workerRepository,
		seasonRepository,
	)
	harvestUseCase := usecase.NewHarvestUseCase(
		config.DB,
		config.Log,
		harvestRepository,
		seasonRepository,
	)
	productionCostUseCase := usecase.NewProductionCostUseCase(
		config.DB,
		config.Log,
		productionCostRepository,
		seasonRepository,
		bagangRepository,
	)
	customerUseCase := usecase.NewCustomerUseCase(
		config.DB,
		config.Log,
		config.Validate,
		customerRepository,
	)
	// setup controller
	// userController := http.NewUserController(userUseCase, config.Log)
	// contactController := http.NewContactController(contactUseCase, config.Log)
	// addressController := http.NewAddressController(addressUseCase, config.Log)
	bagangController := http.NewBagangController(bagangUseCase, config.Log)
	salesController := http.NewSalesController(config.Log, salesUseCase)
	masterDataController := http.NewMasterDataController(config.Log, masterDataUseCase)
	harvestController := http.NewHarvestController(config.Log, harvestUseCase)
	productionCostController := http.NewProductionCostController(config.Log, productionCostUseCase)
	customerController := http.NewCustomerController(config.Log, customerUseCase)

	// setup middleware
	// authMiddleware := middleware.NewAuth(userUseCase)

	routeConfig := route.RouteConfig{
		App: config.App,
		// AuthMiddleware:           authMiddleware,
		BagangController:         bagangController,
		SalesController:          salesController,
		MasterDataController:     masterDataController,
		HarvestController:        harvestController,
		ProductionCostController: productionCostController,
		CustomerController:       customerController,
	}
	routeConfig.Setup()
}

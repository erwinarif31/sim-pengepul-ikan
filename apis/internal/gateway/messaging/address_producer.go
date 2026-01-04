package messaging

import (
	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/sirupsen/logrus"
	"github.com/erwinarif31/catchery-api/internal/model"
)

type AddressProducer struct {
	Producer[*model.AddressEvent]
}

func NewAddressProducer(producer *kafka.Producer, log *logrus.Logger) *AddressProducer {
	return &AddressProducer{
		Producer: Producer[*model.AddressEvent]{
			Producer: producer,
			Topic:    "addresses",
			Log:      log,
		},
	}
}

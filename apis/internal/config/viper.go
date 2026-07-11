package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

// NewViper is a function to load config from config.json
// You can change the implementation, for example load from env file, consul, etcd, etc
func NewViper() *viper.Viper {
	config := viper.New()

	config.SetConfigName("config")
	config.SetConfigType("json")
	config.AddConfigPath("./../")
	config.AddConfigPath("./")
	config.SetDefault("app.name", "catchery-api")
	config.SetDefault("web.prefork", false)
	config.SetDefault("web.port", 8888)
	config.SetDefault("web.cors.origins", "http://localhost:5173,http://127.0.0.1:5173")
	config.SetDefault("log.level", 6)
	config.SetDefault("database.username", "postgres")
	config.SetDefault("database.password", "")
	config.SetDefault("database.host", "localhost")
	config.SetDefault("database.port", 5432)
	config.SetDefault("database.name", "catchery")
	config.SetDefault("database.pool.idle", 10)
	config.SetDefault("database.pool.max", 100)
	config.SetDefault("database.pool.lifetime", 300)
	config.SetDefault("kafka.bootstrap.servers", "localhost:9092")
	config.SetDefault("kafka.group.id", "golang-clean-architecture")
	config.SetDefault("kafka.auto.offset.reset", "earliest")
	config.SetDefault("kafka.producer.enabled", false)

	config.AutomaticEnv()
	config.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	err := config.ReadInConfig()

	if _, ok := err.(viper.ConfigFileNotFoundError); ok {
		return config
	}
	if err != nil {
		panic(fmt.Errorf("Fatal error config file: %w \n", err))
	}

	return config
}

FROM golang:1.23

WORKDIR /app

RUN go install github.com/air-verse/air@v1.61.7

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the source code
COPY . .

# Expose port 8888
EXPOSE 8888

# Run air
CMD ["air", "-c", ".air.toml"]

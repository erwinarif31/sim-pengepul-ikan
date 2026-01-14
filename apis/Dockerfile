FROM golang:1.23

WORKDIR /app

# Install curl (if not already present in the base image, though Debian usually has it or apt-get can install it)
# The golang:1.23 image is based on Debian, so we use apt-get.
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install air using the official install script to get the binary directly
# This avoids "go install" issues if any exist with Go 1.23
RUN curl -sSfL https://raw.githubusercontent.com/air-verse/air/master/install.sh | sh -s -- -b $(go env GOPATH)/bin

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the source code
COPY . .

# Expose port 8081
EXPOSE 8081

# Run air
CMD ["air", "-c", ".air.toml"]

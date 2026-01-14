FROM node:22-alpine

WORKDIR /app

# Enable corepack to use pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose port 5173
EXPOSE 5173

# Run dev server
CMD ["pnpm", "run", "dev", "--", "--host"]

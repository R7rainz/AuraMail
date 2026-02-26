# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
# Install pnpm
RUN npm install -g pnpm

# Copy only package.json and lockfile first for better caching
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Build the Next.js app
RUN pnpm run build

FROM node:20-alpine
WORKDIR /app
# Install pnpm in the runtime image
RUN npm install -g pnpm
COPY --from=builder /app .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]

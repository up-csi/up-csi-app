FROM node:22.19-alpine3.22 AS build

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

# Set work directory
WORKDIR /app

# Load into virtual store
COPY pnpm-lock.yaml .
RUN pnpm fetch

# Copy project files
COPY . .

# Install dependencies
RUN pnpm install --offline

# Build application
RUN pnpm build

# Prune dev dependencies
RUN pnpm prune --prod --ignore-scripts

FROM node:22.19-alpine3.22 AS deploy

# Move built application for deployment
WORKDIR /app
COPY --from=build /app/node_modules node_modules/
COPY --from=build /app/build build/

# Expose port and start server
ENV PORT=3000
EXPOSE ${PORT}
CMD ["build/index.js"]

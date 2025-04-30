# ---------- step 1: build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json -> install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Source Code
COPY . .
# Nest -> dist/
RUN npm run build           
# Create Prisma Client
RUN npx prisma generate     

# ---------- step 2: runtime ----------
# Use a smaller image for the runtime
FROM node:20-slim
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# run
CMD ["node", "dist/main.js"]
FROM node:16.10-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the angular app
RUN npm run build:prod

COPY .htaccess /app/dist/BrettSpiel/.htaccess

# Use a lightweight nginx image to serve the Angular app
FROM nginx:alpine
COPY --from=build /app/dist/BrettSpiel /usr/share/nginx/html

EXPOSE 80:80


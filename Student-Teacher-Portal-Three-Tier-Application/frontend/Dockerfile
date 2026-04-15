FROM node:21-alpine3.17 AS build
WORKDIR /app

# Copy dependency definitions first
COPY package*.json ./

# Install all dependencies in one layer
RUN npm install

# Copy the rest of the project files
COPY . .

# Pass build-time variable
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Build the React app
RUN npm run build

# ---- Stage 2: Serve build with Nginx ----
FROM nginx:1.25.3-alpine

# Copy build artifacts from previous stage
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


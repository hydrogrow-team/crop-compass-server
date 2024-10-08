# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.17.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS"

# NodeJS app lives here
WORKDIR /app

# Set environment variables
ENV SECRET_KEY=b4880f3f65ef4b1a7415f96dab24c843c5fca6fc7692ccac7f9f085d334aaf8f2c4c2b8ef4
ENV MONGODB_URI=mongodb+srv://aymanyasser:fZqw1tlVzL4VE6at@cluster0.05umo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
ENV NODE_ENV=development
ENV EARTHDATA_TOKEN=eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImF5bWFueWFzc2VyIiwiZXhwIjoxNzMzMjI2NTU1LCJpYXQiOjE3MjgwNDI1NTUsImlzcyI6Imh0dHBzOi8vdXJzLmVhcnRoZGF0YS5uYXNhLmdvdiJ9.K3H0ZenyCx5sOjjKMymSGHKMjdXCXSRmC8bCPLzyeITaZJg4TM-TZK1zCxN6H76dnVflh-fNaDZdUPGA0qiokRhUmgXec1R5fs8ocNH-GHhVDiArRDPOFeqx2V6X3x_NAcy8C9KE8KRcKITHHvMk4eR9iXMV2RLXq4vaZQ3wLa3CNFxnN4dOzYCzsjU6_YdM__5ssAxJF_x0K9v4rK0qerDuK7ORo5mGdlcGGDaQ2JDt9fwEJOFB_vU3V-qagDoRz_rvW5WX3Jvclq1kUnuNc-qiL_G1wn0Egg2DeJB62YI6YQxz2GwBZDiALjjjK_x2jmW_3FqKuxta4XtolZwIKQ
ENV WEATHER_API_KEY=7XD6NMGXWYFX7E2X7K46LKW55
ENV GEMINI_API_KEY=AIzaSyD7P9ErY19xSfs1GHmPcJmZgPewe_IXJqE
ENV AI_RECOMMENDATION_API=https://crop-compass-ai.onrender.com

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential 

# Install node modules
COPY --link package.json package-lock.json ./
RUN npm install

# Copy application code
COPY --link . ./

# Build application
RUN npm run build

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
CMD [ "npm", "run", "start" ]

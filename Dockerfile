# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

#install nodemon globally
RUN npm install -g nodemon

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["nodemon", "index.js"]

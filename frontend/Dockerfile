FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose port for Next.js dev server
EXPOSE 3000

# Set environment variable for Next.js to listen on all interfaces
ENV HOSTNAME="0.0.0.0"

# Command to run the Next.js development server
CMD ["npm", "run", "dev"]

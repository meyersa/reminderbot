FROM node:23-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy bot source code into the container
COPY . ./

CMD ["node", "main.js"]
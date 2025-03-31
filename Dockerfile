FROM node:23-alpine
WORKDIR /app

# SIGKILL Fix
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy bot source code into the container
COPY src ./src

CMD ["node", "main.js"]
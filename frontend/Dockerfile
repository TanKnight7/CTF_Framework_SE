FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.* ./
RUN npm install


COPY . .

RUN npm run build

# CMD ["npm", "run", "start"]
CMD ["npm", "run", "dev"]
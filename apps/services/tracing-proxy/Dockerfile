FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY src/ ./src/

RUN mkdir -p logs

EXPOSE 3025

CMD ["npm", "start"]
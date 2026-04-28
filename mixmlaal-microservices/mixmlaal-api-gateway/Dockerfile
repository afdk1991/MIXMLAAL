FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install express-gateway --save

COPY gateway.config.yml ./

EXPOSE 8080 9876

CMD ["npx", "express-gateway", "start"]
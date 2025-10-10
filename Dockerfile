FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN mkdir -p /app/dist/commands
EXPOSE 8080
CMD ["npm", "start"]
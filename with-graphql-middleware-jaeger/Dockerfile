FROM node:11 AS build

WORKDIR /app

# copy base files and install deps
COPY tsconfig.json package.json yarn.lock /app/
RUN yarn

# copy src code and build app
COPY src /app/src
RUN yarn build

FROM node:11-alpine

WORKDIR /app

# install build deps, install service deps, remove build deps
RUN apk add --no-cache --virtual node-build-deps make gcc g++ python
COPY --from=build /app/package.json /app/yarn.lock /app/
RUN yarn --production
RUN apk del node-build-deps

# copy built app
COPY --from=build /app/build /app/build

# run
EXPOSE 4000
CMD node build

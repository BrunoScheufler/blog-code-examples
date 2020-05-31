FROM cypress/base:latest
WORKDIR /app/

COPY package.json yarn.lock /app/

RUN yarn install

COPY cypress.json /app/
COPY cypress /app/cypress
COPY .git /app/.git

CMD yarn cypress run --record --parallel --ci-build-id $BUILD_ID
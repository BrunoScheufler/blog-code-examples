FROM cypress/base:latest
WORKDIR /app/

COPY package.json yarn.lock /app/

RUN yarn install

COPY cypress.json /app/
COPY cypress /app/cypress

CMD yarn cypress run --record --key $PROJECT_KEY --parallel --ci-build-id $BUILD_TAG
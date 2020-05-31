FROM cypress/base:latest
WORKDIR /app/

COPY package.json yarn.lock /app/

RUN yarn install

COPY cypress.json /app/
COPY cypress /app/cypress

CMD yarn cypress run --record --key $CYPRESS_SECRET_KEY --parallel --ci-build-id $BUILD_TAG
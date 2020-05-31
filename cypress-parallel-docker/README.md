# Cypress tests run in parallel powered by Docker Compose and Cypress Dashboard

This directory contains everything needed to run cypress tests in Docker compose, supporting dynamic parallelization (by starting multiple container instances),
orchestrated by Cypress Dashboard.

## Configuring your Cypress project

Open the Cypress test runner using the following command

```bash
yarn cypress open
```

and follow the steps outlined in [this setup guide](https://docs.cypress.io/guides/dashboard/projects.html#Setup).

## Running your tests

First, copy over `.env.sample` to `.env` and fill in your secret record key, used for authorizing with Cypress Dashboard.
For each run, you also need to supply a unique identifier, referred to as `BUILD_ID` This should be supplied dynamically.

```bash
# When running in CI, you're most likely able to use an identifier from your environment
# https://docs.cypress.io/guides/guides/parallelization.html#CI-Build-ID-environment-variables-by-provider
export BUILD_ID="<randomly-generated identifier>"

docker-compose down -v

docker-compose build

# Scale manages count of container instances and thus level of parallelization, more instances = faster test runs
docker-compose up --scale tests=4
```

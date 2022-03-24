# Gaia-X Lab Registry

## Getting started

Clone the repository and jump into the newly created directory:

```sh
git clone https://gitlab.com/gaia-x/lab/compliance/gx-registry.git
cd gx-registry
```

Next we need to take care of the initial setup of the project:

```sh
# Install all the dependencies
npm install

# Make sure the ./dist folder exists
mkdir ./dist

# Create a .env file or use the example:
# The PORT .env variable is required to be set
mv .env.example .env

# Make sure npx is installed, as it is used for our commitlint setup
npm install -g npx
```

If everything is setup correctly, you can start the development environment with docker-compose. Make sure that the Docker daemon is running on your host operating system.

```sh
docker-compose up
```

## Default Setup

Credits to the (typescript-express-starter)[https://github.com/ljlm0402/typescript-express-starter#readme] repository at https://github.com/ljlm0402/typescript-express-starter#readme. This repository uses a customized & enhanced version of the `Mongoose` template.

- Typesript enabled
- Prettier setup with husky to follow & enforce code styling standards upon commits
- Swagger documentation via a `./swagger.yml` file, available at `[host]/api-docs`
- Dockerfile to be used in `development` & `production` environments
- Quick development setup via `docker compose` -> `docker compose up` will serve `localhost:3000`
- VSCode Extensions and on-save formatting
- Sample K8 deployment files for easy MongoDB & Server pod deployments, located at `deploy/[mongo/server]-deployment.yaml`
- TODO: Testing setup with jest

FROM node:lts-alpine@sha256:2c6c59cf4d34d4f937ddfcf33bab9d8bbad8658d1b9de7b97622566a52167f2b as production-build-stage

RUN apk add dumb-init

ARG HOME=/home/node

USER node

RUN mkdir $HOME/app

WORKDIR $HOME/app

EXPOSE 3000

ENV NPM_CONFIG_PREFIX=$HOME/.npm-global
ENV PATH=$PATH:$HOME/.npm-global/bin
ENV NODE_ENV production

COPY --chown=node:node . ./

RUN npm ci --only=production

CMD ["dumb-init", "npm", "start"]
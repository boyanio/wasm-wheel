FROM trzeci/emscripten:1.39.11-upstream AS wheel-part-php

WORKDIR /work
COPY . .

ENV PIB_REPO_URL=https://github.com/oraoto/pib
ENV PIB_COMMIT_ID=7d4368235c0cda437ee47cbd389d7c11e179a371

RUN curl -SL $PIB_REPO_URL/archive/$PIB_COMMIT_ID.tar.gz | tar xz && \
    cd ./pib-$PIB_COMMIT_ID && \
    chmod +x ./build.sh && \
    ./build.sh && \
    mkdir ../../output && \
    mv ./php.* ../../output && \
    cd .. && \
    cp wheel-part.php ../output/wheel-part-php.txt && \
    rm -rf ./pib-$PIB_COMMIT_ID
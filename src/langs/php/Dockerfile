FROM trzeci/emscripten:sdk-tag-1.38.25-64bit AS wheel-part-php

WORKDIR /work

COPY src/langs/php .

ENV PIB_COMMIT="ada27dc314f37fc7051cff008a7b075dd2057a90"

RUN curl -SL https://github.com/oraoto/pib/archive/$PIB_COMMIT.tar.gz | tar xz && \
    cd ./pib-$PIB_COMMIT && \
    chmod +x ./build.sh && \
    ./build.sh && \
    mkdir ../../output && \
    mv ./php.* ../../output && \
    cd .. && \
    cp wheel-part.php ../output/wheel-part-php.txt && \
    rm -rf ./pib-$PIB_COMMIT
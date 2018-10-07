FROM trzeci/emscripten:sdk-tag-1.38.12-64bit AS wheel-part-php

WORKDIR /work

COPY src/langs/php .

RUN curl -SL https://github.com/boyanio/pib/archive/master.tar.gz | tar xz && \
    chmod +x ./pib-master/build.sh && \
    ./pib-master/build.sh && \
    mkdir ../output && \
    mv ./pib-master/php.* ../output && \
    cp wheel-part.php ../output/wheel-part-php.txt && \
    rm -rf ./pib-master
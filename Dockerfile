FROM ubuntu:xenial

#
# Configure toolchains to build each wheel part
#

WORKDIR /toolchains

# Configure Java
ENV JAVA_VERSION="8"

RUN apt-get update && \
    apt-get install --no-install-recommends --no-install-suggests -y "openjdk-${JAVA_VERSION}-jdk" && \
    apt-get clean && \
    java -version

RUN apt-get update && \
    apt-get install --no-install-recommends --no-install-suggests -y maven && \
    apt-get clean && \
    mvn -v

# Configure Kotlin
ENV KOTLIN_NATIVE_VERSION="0.8.2"
ENV PATH="/toolchains/kotlin-native-linux-${KOTLIN_NATIVE_VERSION}/bin:${PATH}"

RUN apt-get update && \
    apt-get install --no-install-recommends --no-install-suggests -y wget && \
    wget "https://github.com/JetBrains/kotlin-native/releases/download/v${KOTLIN_NATIVE_VERSION}/kotlin-native-linux-${KOTLIN_NATIVE_VERSION}.tar.gz" && \
    tar xzvf "kotlin-native-linux-${KOTLIN_NATIVE_VERSION}.tar.gz" && \
    rm -f "kotlin-native-linux-${KOTLIN_NATIVE_VERSION}.tar.gz" && \
    konanc -version

# Configure Go
ENV GO_VERSION="1.11"
ENV PATH="/toolchains/go/bin:${PATH}"

RUN wget "https://dl.google.com/go/go${GO_VERSION}.linux-amd64.tar.gz" && \
    tar xzvf "go${GO_VERSION}.linux-amd64.tar.gz" && \
    rm -f "go${GO_VERSION}.linux-amd64.tar.gz" && \
    go version

# Configure C#
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF && \
    apt install --no-install-recommends --no-install-suggests -y apt-transport-https && \
    echo "deb https://download.mono-project.com/repo/ubuntu stable-xenial main" | tee /etc/apt/sources.list.d/mono-official-stable.list && \
    apt update && \
    apt install --no-install-recommends --no-install-suggests -y mono-devel && \
    apt clean && \
    mcs --version

# Configure Rust
ENV PATH="/root/.cargo/bin:${PATH}"

RUN apt-get update && \
    apt-get install --no-install-recommends --no-install-suggests -y curl && \
    apt-get clean && \
    curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain stable -y && \
    rustup update && \
    rustup target add wasm32-unknown-unknown && \
    rustc -V

#
# Configure the app
#

# Configure Node.js
ENV NODE_VERSION="8"

RUN curl -sL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash - && \
    apt-get install --no-install-recommends --no-install-suggests -y nodejs && \
    apt-get clean && \
    node -v

# Configure git
RUN apt-get install --no-install-recommends --no-install-suggests -y git && \
    apt-get clean && \
    git --version

# Create the working dir
WORKDIR /app

# Copy the source
COPY . .

RUN npm i npm@latest -g && \
    npm install

# Build all wheel parts
RUN npm run build && \
    rm -rf /toolchains/* && \
    rm -rf /root/.m2/* && \
    rm -rf /root/.rustup/* && \
    rm -rf /root/.konan/*

# Run the app and expose it on port 8080
EXPOSE 8080
CMD [ "npm", "run", "serve" ]
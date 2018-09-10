FROM ubuntu:xenial

#
# Configure toolchains to build each wheel part
#

WORKDIR /toolchains

## Configure Java
ENV JAVA_VERSION="8"

RUN apt-get update && \
    apt-get install --no-install-recommends --no-install-suggests -y "openjdk-${JAVA_VERSION}-jdk" && \
    java -version

RUN apt-get update && \
    apt-get install --no-install-recommends --no-install-suggests -y maven && \
    mvn -v

# Configure Kotlin
ENV KOTLIN_NATIVE_VERSION="0.8.2"

RUN apt-get update && \
    apt-get install --no-install-recommends --no-install-suggests -y wget && \
    wget "https://github.com/JetBrains/kotlin-native/releases/download/v${KOTLIN_NATIVE_VERSION}/kotlin-native-linux-${KOTLIN_NATIVE_VERSION}.tar.gz" && \
    tar xzvf "kotlin-native-linux-${KOTLIN_NATIVE_VERSION}.tar.gz" && \
    rm -f "kotlin-native-linux-${KOTLIN_NATIVE_VERSION}.tar.gz"

ENV PATH="/toolchains/kotlin-native-linux-${KOTLIN_NATIVE_VERSION}/bin:${PATH}"

RUN konanc -version

# Configure Go
ENV GO_VERSION="1.11"

RUN wget "https://dl.google.com/go/go${GO_VERSION}.linux-amd64.tar.gz" && \
    tar xzvf "go${GO_VERSION}.linux-amd64.tar.gz" && \
    rm -f "go${GO_VERSION}.linux-amd64.tar.gz"

ENV PATH="/toolchains/go/bin:${PATH}"

RUN go version

# Configure C#
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF && \
    apt install -y apt-transport-https && \
    echo "deb https://download.mono-project.com/repo/ubuntu stable-xenial main" | tee /etc/apt/sources.list.d/mono-official-stable.list && \
    apt update && \
    apt install -y mono-devel && \
    mcs --version

# Configure Rust
RUN apt-get update && \
    apt-get install --no-install-recommends --no-install-suggests -y curl && \
    curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain stable -y

ENV PATH="/root/.cargo/bin:${PATH}"

RUN rustup update && \
    rustup target add wasm32-unknown-unknown && \
    rustc -V


#
# Configure the app
#

# Configure Node.js
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install --no-install-recommends --no-install-suggests -y nodejs && \
    node -v

# Create the working dir
WORKDIR /app

# Update npm to latest and install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm i npm@latest -g && \
    npm install

# Copy the source
COPY . .

# Build all wheel parts
RUN npm run build

# Clean build artifacts to minimize image size
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /toolchains/* && \
    rm -rf /root/.m2/* && \
    rm -rf /root/.rustup/* && \
    rm -rf /root/.konan/*

# Run the app and expose it on port 8080
EXPOSE 8080
CMD [ "npm", "run", "serve" ]
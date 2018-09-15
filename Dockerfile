FROM ubuntu:xenial

# Create the working dir and copy the sources
WORKDIR /app
COPY . .

# Configure Node.js
ENV NODE_VERSION="8"

RUN apt-get update && \
    apt-get install --no-install-recommends --no-install-suggests -y ca-certificates wget && \
    wget -qO- "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash - && \
    apt-get install --no-install-recommends --no-install-suggests -y nodejs git && \
    apt-get clean

# Install npm dependencies
RUN npm i npm@latest -g && \
    npm install

# Build the metadata and C and AssemblyScript wheel parts,
# as they can be built using npm
RUN npm run build -- metadata c assemblyscript

# Build Java wheel part
ENV JAVA_VERSION="8"

RUN apt-get install --no-install-recommends --no-install-suggests -y "openjdk-${JAVA_VERSION}-jdk" maven && \
    apt-get clean

RUN npm run build -- java && \
    rm -rf /root/.m2/*

# Build Kotlin wheel part
ENV KOTLIN_NATIVE_VERSION="0.8.2"
ENV PATH="/app/kotlin-native-linux-${KOTLIN_NATIVE_VERSION}/bin:${PATH}"

RUN wget "https://github.com/JetBrains/kotlin-native/releases/download/v${KOTLIN_NATIVE_VERSION}/kotlin-native-linux-${KOTLIN_NATIVE_VERSION}.tar.gz" && \
    tar xzf "kotlin-native-linux-${KOTLIN_NATIVE_VERSION}.tar.gz" && \
    rm -f "kotlin-native-linux-${KOTLIN_NATIVE_VERSION}.tar.gz"

RUN npm run build -- kotlin && \
    rm -rf /root/.konan/*

# Build Go wheel part
ENV GO_VERSION="1.11"
ENV PATH="/app/go/bin:${PATH}"

RUN wget "https://dl.google.com/go/go${GO_VERSION}.linux-amd64.tar.gz" && \
    tar xzf "go${GO_VERSION}.linux-amd64.tar.gz" && \
    rm -f "go${GO_VERSION}.linux-amd64.tar.gz"

RUN npm run build -- go

# Configure C#
RUN apt-get install --no-install-recommends --no-install-suggests -y mono-mcs && \
    apt clean

RUN npm run build -- csharp

# Configure Rust
ENV PATH="/root/.cargo/bin:${PATH}"

RUN wget -qO- https://sh.rustup.rs | sh -s -- --default-toolchain stable -y && \
    rustup update && \
    rustup target add wasm32-unknown-unknown

RUN npm run build -- rust && \
    rm -rf /root/.rustup/*

# Run the app and expose it on port 8080
EXPOSE 8080
CMD [ "npm", "run", "serve" ]
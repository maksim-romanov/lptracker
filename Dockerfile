FROM node:20-bookworm

# Install deps
RUN apt-get update && apt-get install -y \
    git curl python3 python3-pip python3-venv gh make ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Bun
RUN curl -fsSL https://bun.sh/install | bash && mv /root/.bun/bin/bun /usr/local/bin/bun

# Global tools
RUN npm install -g eas-cli @anthropic-ai/claude-code

# Poetry
RUN curl -sSL https://install.python-poetry.org | python3 - && ln -s /root/.local/bin/poetry /usr/local/bin/poetry

# Workdir
WORKDIR /app

# Copy your docker context (so Dockerfile inside project works, bun install runs)
COPY . /app/lptracker

# Bun install for your project
WORKDIR /app/lptracker
RUN bun install

# Clone and install the bot
WORKDIR /app
RUN git clone --depth=1 https://github.com/RichardAtCT/claude-code-telegram.git /app/claude-bot
WORKDIR /app/claude-bot
RUN poetry install --no-root

# Environment defaults (runtime secrets will override)
ENV PATH="/root/.bun/bin:/root/.local/bin:$PATH"
ENV APPROVED_DIRECTORY=/app

# CMD will: clone repo with token, set git config, run bot
CMD git config --global user.name  "$GIT_USERNAME" && \
    git config --global user.email "$GIT_EMAIL" && \
    git -C /app/lptracker remote set-url origin "https://${GIT_USERNAME}:${GIT_TOKEN}@${GIT_REPO}" && \
    poetry run claude-telegram-bot

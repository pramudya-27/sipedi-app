FROM python:3.12-slim

# Install system dependencies needed for compilation & SSL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set up user with UID 1000 required by Hugging Face Spaces
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

WORKDIR $HOME/app

# Copy requirements first for Docker layer caching
COPY --chown=user requirements.txt $HOME/app/
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy application code
COPY --chown=user . $HOME/app

# Create uploads directory with write permissions
RUN mkdir -p $HOME/app/uploads && chmod 777 $HOME/app/uploads

# Hugging Face Spaces listens on port 7860
EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]

# Use official Python image
FROM python:3.10

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies (if any)
RUN pip install --no-cache-dir -r requirements.txt || true

# Run app
CMD ["python", "app.py"]

FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y libglib2.0-0 libsm6 libxext6 libxrender-dev curl && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY api.py preprocessing.py ./
COPY kaggle_model/ ./kaggle_model/
ENV TF_CPP_MIN_LOG_LEVEL=2
ENV OMP_NUM_THREADS=2
ENV TF_NUM_INTRAOP_THREADS=2
ENV TF_NUM_INTEROP_THREADS=2
EXPOSE 8000
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]


FROM python:3.11-slim

WORKDIR /app

RUN pip install --upgrade pip \
    && pip install fastapi uvicorn jinja2 firebase-admin requests beautifulsoup4 finmind pandas numpy scikit-learn

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]

# syntax=docker/dockerfile:1

FROM python:3.11-slim

WORKDIR /edshira

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

WORKDIR /edshira/src

EXPOSE 30095
CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8080"]
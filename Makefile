.PHONY: help install train test lint format docker-build docker-up docker-down k8s-deploy clean

help:
	@echo "EcoPredict - Available Commands:"
	@echo "  make install        - Install dependencies"
	@echo "  make train          - Train ML model"
	@echo "  make test           - Run tests"
	@echo "  make lint           - Run linters"
	@echo "  make format         - Format code"
	@echo "  make docker-build   - Build Docker images"
	@echo "  make docker-up      - Start Docker services"
	@echo "  make docker-down    - Stop Docker services"
	@echo "  make k8s-deploy     - Deploy to Kubernetes"
	@echo "  make clean          - Clean generated files"

install:
	pip install -r requirements.txt
	pip install -r requirements-dev.txt

train:
	python src/train_model.py

test:
	pytest tests/ -v --cov=src --cov-report=html

lint:
	flake8 src/ tests/ --max-line-length=100
	mypy src/ --ignore-missing-imports

format:
	black src/ tests/
	isort src/ tests/

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

k8s-deploy:
	kubectl apply -f k8s/deployment.yml

k8s-status:
	kubectl get pods -n ecopredict
	kubectl get svc -n ecopredict

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	rm -rf .pytest_cache .mypy_cache .coverage htmlcov
	rm -rf models/*.pkl

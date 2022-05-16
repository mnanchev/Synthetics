FROM public.ecr.aws/lambda/python:3.9.2022.04.27.10-x86_64
COPY deployment/app.py requirements.txt best_estimator_model_0.6318845577211395_sgc.pkl ${LAMBDA_TASK_ROOT}
RUN pip3 install -r requirements.txt
CMD ["app.lambda_handler"]
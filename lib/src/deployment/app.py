from copy import deepcopy
import logging
import sys

try:
    import pandas as pd
    import numpy as np
    import joblib
    from sklearn import preprocessing
    from sklearn.utils.validation import column_or_1d
    from sklearn import preprocessing
    from sklearn.model_selection import GridSearchCV, StratifiedKFold
    from sklearn.pipeline import Pipeline
    from sklearn.linear_model import SGDClassifier
    from sklearn.preprocessing import RobustScaler
except Exception as exception:
    logging.error(
        "Unable to import required modules. {exception.with_traceback()}")
    sys.exit(1)


def lambda_handler(event, context):
    data = deepcopy(event)
    model = joblib.load("best_estimator_model_0.6318845577211395_sgc.pkl")
    try:
        hrv = int(data["hrv"])
    except KeyError:
        logging.error("No hrv value provided.")
        sys.exit(1)
    try:
        heart_rate = int(data["heart_rate"])
    except KeyError:
        logging.error("No heart rate found")
        sys.exit(1)
    x = pd.DataFrame()
    x["HeartRate"] = [heart_rate]
    x["HeartRateVariabilitySDNN"] = [hrv]
    prediction = model.predict(x)
    prediction = prediction.tolist()
    return {'prediction': str([prediction[0], x]), 'statusCode': 200}
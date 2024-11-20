import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error
import numpy as np
import matplotlib.pyplot as plt
import joblib

def train_model():
    # Učitavanje podataka
    data = pd.read_csv('C:\\Users\\pc\\Documents\\softvEksploatacija\\projekat\\OffGridSystemProject\\backend\\Services\\ForecastPredictionService\\dataForPrediction.csv')

    # Priprema podataka
    data['sunrise'] = pd.to_datetime(data['sunrise']).dt.tz_localize(None)
    data['sunset'] = pd.to_datetime(data['sunset']).dt.tz_localize(None)
    data['timestamp'] = pd.to_datetime(data['timestamp']).dt.tz_localize(None)

    data['daylight'] = ((data['timestamp'] >= pd.to_datetime(data['sunrise'])) & 
                        (data['timestamp'] <= pd.to_datetime(data['sunset']))).astype(int)

    features = ['currentOutsideTemperature', 'currentCloudinessPercent', 'daylight']
    X = data[features]
    y = data['panelCurrentPower']

    # Podela na trening i test set
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Treniranje modela
    model = GradientBoostingRegressor()
    model.fit(X_train, y_train)

    # Evaluacija
    y_pred = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    print(f"RMSE: {rmse}")

    # Čuvanje modela
    joblib.dump(model, 'C:\\Users\\pc\\Documents\\softvEksploatacija\\projekat\\OffGridSystemProject\\backend\\Services\\ForecastPredictionService\\trained_model.pkl')
    print("Model je uspešno sacuvan.")

def load_model():
    # Učitavanje treniranog modela
    return joblib.load('C:\\Users\\pc\\Documents\\softvEksploatacija\\projekat\\OffGridSystemProject\\backend\\Services\\ForecastPredictionService\\trained_model.pkl')



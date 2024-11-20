from flask import Flask, request, jsonify
import numpy as np
import requests
import pandas as pd
import json
import os
from weather_forecast import train_model, load_model

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    
    API_KEY = 'a9499caca355ee647c55a906ad8340fa';
    # Pristup podacima unutar JSON-a
    data = request.get_json()  
    LAT = data.get('LAT')
    LON = data.get('LON')

    # Provera podataka i vraćanje odgovora
    if LAT is not None and LON is not None:
        # Tvoja logika za obradu podataka
        print({"message": "Podaci su primljeni", "LAT": LAT, "LON": LON})
    else:
        print({"error": "Nedostaju parametri"})

    # API poziv za vremensku prognozu
    url = f"http://api.openweathermap.org/data/2.5/forecast?lat={LAT}&lon={LON}&units=metric&appid={API_KEY}"
    response = requests.get(url)
    data = response.json()

    # Parsiranje podataka iz API-ja
    future_data = []
    for entry in data['list'][:48]:  # Uzimamo prvih 48 vremenskih prognoza
        future_data.append({
            'timestamp': entry['dt_txt'],  # Vremenska oznaka
            'currentOutsideTemperature': entry['main']['temp'],  # Temperatura
            'currentCloudinessPercent': entry['clouds']['all'],  # Procenat oblačnosti
            'daylight': 1 if '06:00:00' <= entry['dt_txt'][-8:] <= '18:00:00' else 0  # Dan/noć logika
        })


    # Kreiranje DataFrame-a za buduće podatke
    future_data = pd.DataFrame(future_data)
    future_data['timestamp'] = pd.to_datetime(future_data['timestamp'])
    
    # Proveri da li model postoji, ako ne, treniraj ga
    model_path = 'C:\\Users\\pc\\Documents\\softvEksploatacija\\projekat\\OffGridSystemProject\\backend\\Services\\ForecastPredictionService\\trained_model.pkl';
    #if not os.path.exists(model_path):
    train_model();

    # Učitaj trenirani model
    model = load_model();
    
    # Predikcija na osnovu budućih podataka - ovde mi treba taj model
    predictions = model.predict(future_data[['currentOutsideTemperature', 'currentCloudinessPercent', 'daylight']])
    # Ograničavanje predikcija na nenegativne vrednosti
    predictions = np.maximum(predictions, 0)  # Sve negativne vrednosti postavlja na 0

    # Dodavanje predikcija u dataframe
    future_data['predicted_power'] = predictions
    
    predictions_list = predictions.tolist()

    return jsonify(future_data.to_json(orient='records'))
    

if __name__ == '__main__':
    app.run(port=5009)

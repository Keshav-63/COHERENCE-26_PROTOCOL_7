import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class MLAnomalyEngine:
    def __init__(self):
        # contamination=0.05 means we expect roughly 5% of data to be 'leaks'
        self.model = IsolationForest(contamination=0.05, random_state=42)

    def detect_outliers(self, current_transaction: dict, reference_data: list):
        """
        Compares the new transaction against a list of recent transactions.
        """
        if not reference_data or len(reference_data) < 10:
            return 0.2, "Insufficient peer data for ML comparison."

        # Convert peer data to a DataFrame for the model
        df = pd.DataFrame(reference_data)
        
        # Features to check: Amount and Frequency (how often this vendor is paid)
        features = df[['amount', 'frequency']]
        
        # Train the model on the peer group
        self.model.fit(features)
        
        # Format the current transaction for prediction
        current_features = np.array([[current_transaction['amount'], current_transaction['frequency']]])
        
        # Predict: -1 is an outlier, 1 is normal
        prediction = self.model.predict(current_features)
        
        if prediction[0] == -1:
            return 0.8, "Statistical Outlier: Transaction deviates from peer behavior."
        
        return 0.0, "Transaction mathematically aligned with peer group."
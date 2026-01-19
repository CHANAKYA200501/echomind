import numpy as np
from sklearn.ensemble import RandomForestClassifier

def load_model():
    X = np.array([
        [70, 4, 2, 85],   # normal
        [60, 6, 4, 75],
        [45, 12, 7, 40],  # stressed
        [35, 18, 10, 25]
    ])
    y = [0, 0, 1, 1]

    model = RandomForestClassifier(n_estimators=120)
    model.fit(X, y)
    return model
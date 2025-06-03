import numpy as np

def calculate_z_scores(df):
    return (df['x'] - df['mu']) / df['sigma']

def aggregate_series(z_scores, timestamps, method='mean', target_len=200):
    indices = np.linspace(0, len(z_scores), target_len + 1, dtype=int)
    z_agg = []
    t_agg = []

    for i in range(len(indices) - 1):
        start, end = indices[i], indices[i + 1]
        if method == 'mean':
            z_agg.append(np.nanmean(z_scores[start:end], axis=0))
        elif method == 'max':
            z_agg.append(np.nanmax(z_scores[start:end], axis=0))
        else:
            raise ValueError("Unsupported aggregation method")
        t_agg.append(timestamps[start])

    return np.array(z_agg).T, np.array(t_agg)

import numpy as np

def aggregate_timeseries(df, n_chunks, method):
    """
    Aggregates a multivariate time series DataFrame into n_chunks.

    Parameters:
    - df: Pandas DataFrame with datetime index and only z_score columns (z_score__var1, z_score__var2, ...)
    - n_chunks: Number of chunks to downsample into
    - method: Aggregation method: 'mean', 'median', 'max', 'min', 'std'

    Returns:
    - z_agg: (n_chunks, n_vars) NumPy array with aggregated values
    - time_agg: (n_chunks,) NumPy array of timestamps (datetime64)
    """
    z = df.to_numpy()
    timestamps = df.index.to_numpy()
    n_rows, n_vars = z.shape

    chunk_size = int(np.ceil(n_rows / n_chunks))
    pad_len = chunk_size * n_chunks - n_rows

    # Pad arrays
    if pad_len > 0:
        z = np.pad(z, ((0, pad_len), (0, 0)), mode='constant', constant_values=np.nan)
        timestamps = np.pad(timestamps, (0, pad_len), mode='edge')

    # Reshape
    z_reshaped = z.reshape(n_chunks, chunk_size, n_vars)
    t_reshaped = timestamps.reshape(n_chunks, chunk_size)

    # Aggregate Z-scores
    if method == 'mean':
        z_agg = np.nanmean(z_reshaped, axis=1)
    elif method == 'median':
        z_agg = np.nanmedian(z_reshaped, axis=1)
    elif method == 'max':
        z_agg = np.nanmax(z_reshaped, axis=1)
    elif method == 'min':
        z_agg = np.nanmin(z_reshaped, axis=1)
    elif method == 'std':
        z_agg = np.nanstd(z_reshaped, axis=1)
    elif method == 'sum':
        z_agg = np.nansum(z_reshaped, axis=1)
    else:
        raise ValueError(f"Unsupported aggregation method: {method}")

    z_agg = z_agg.T

    # Timestamps: first of each chunk
    time_agg = t_reshaped[:, 0]

    return z_agg, time_agg


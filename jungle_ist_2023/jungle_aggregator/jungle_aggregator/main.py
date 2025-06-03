import pandas as pd
import numpy as np
from jungle_aggregator.aggregator import calculate_z_scores, aggregate_series

def main():
    parquet_path = input("Enter the path to the parquet file (jungle_case_1_data): ")
    start_day = input("Enter the start date (YYYY-MM-DD): ").strip()
    end_day = input("Enter the end date (YYYY-MM-DD): ").strip()
    agg_type = input("Enter aggregation type (mean or max): ").strip().lower()

    df = pd.read_parquet(parquet_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df[(df['timestamp'] >= start_day) & (df['timestamp'] <= end_day)]
    
    variables = ['var1', 'var2', 'var3']
    z_scores = []

    for var in variables:
        df_var = df[df['variable'] == var]
        df_var = df_var.sort_values('timestamp')
        z = (df_var['x'] - df_var['mu']) / df_var['sigma']
        z_scores.append(z.to_numpy())

    timestamps = df[df['variable'] == variables[0]]['timestamp'].sort_values().to_numpy()
    z_scores = np.array(z_scores)

    z_agg, t_agg = aggregate_series(z_scores.T, timestamps, method=agg_type)

    print("Z-score array (shape {}):\n".format(z_agg.shape), z_agg)
    print("\nTimestamp array (shape {}):\n".format(t_agg.shape), t_agg)

main()
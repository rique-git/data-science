import pandas as pd
from aggregator import aggregate_timeseries

def main():
    parquet_path = input("Enter the path to the parquet file (jungle_case_1_data): ")
    start_day = input("Enter the start date (YYYY-MM-DD): ").strip()
    end_day = input("Enter the end date (YYYY-MM-DD): ").strip()
    agg_type = input("Enter aggregation type (mean/median/max/min/std): ").strip().lower()

    data = pd.read_parquet(parquet_path)
    df = data.loc[start_day:end_day].copy()

    number_of_vars = 3
    number_of_chunks = 200
    vars = []

    for i in range(1, number_of_vars + 1):
        df['z_score__var'+str(i)] = ((df['true_value__var'+str(i)] - df['prediction_mu__var'+str(i)]) /df['prediction_sigma__var'+str(i)])
        vars.append('z_score__var'+str(i))

    df = df[vars]

    z_agg, time_agg = aggregate_timeseries(df, n_chunks=number_of_chunks, method=agg_type)

    print("Z-score array (shape {}):\n".format(z_agg.shape), z_agg)
    print("\nTimestamp array (shape {}):\n".format(time_agg.shape), time_agg)

main()
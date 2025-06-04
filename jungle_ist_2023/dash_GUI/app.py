import dash
from dash import dcc, html, Input, Output, State
import pandas as pd
import plotly.express as px
from aggregator import aggregate_timeseries  # Make sure this is in the same folder

app = dash.Dash(__name__)
app.title = "Time Series Aggregation Tool"

app.layout = html.Div([
    html.H2("📊 Time Series Aggregation Tool", style={'textAlign': 'center', 'marginBottom': '20px'}),

    html.Div([
        html.Div([
            html.Label("Parquet File Path:"),
            dcc.Input(id='data-path', type='text', value='jungle_case_1_data', style={'width': '100%'})
        ], style={'marginBottom': '10px'}),

        html.Div([
            html.Label("Start Date (YYYY-MM-DD):"),
            dcc.Input(id='start-date', type='text', value='2020-01-01', style={'width': '100%'})
        ], style={'marginBottom': '10px'}),

        html.Div([
            html.Label("End Date (YYYY-MM-DD):"),
            dcc.Input(id='end-date', type='text', value='2025-01-01', style={'width': '100%'})
        ], style={'marginBottom': '10px'}),

        html.Div([
            html.Label("Aggregation Type:"),
            dcc.Dropdown(
                id='agg-type',
                options=[{'label': agg, 'value': agg} for agg in ['mean', 'median', 'sum', 'max', 'min', 'std']],
                placeholder='Select aggregation method',
                style={'width': '100%'}
            )
        ], style={'marginBottom': '10px'}),

        html.Button('Run Aggregation', id='run-btn', n_clicks=0, style={'width': '100%', 'marginTop': '10px'})
    ], style={'width': '30%', 'margin': 'auto'}),

    html.Hr(),

    html.Div(id='agg-plot', style={'padding': '20px'}),
    html.Div(id='table-preview', style={'whiteSpace': 'pre-wrap', 'padding': '20px', 'backgroundColor': '#f9f9f9'})
])

@app.callback(
    [Output('agg-plot', 'children'),
     Output('table-preview', 'children')],
    Input('run-btn', 'n_clicks'),
    State('data-path', 'value'),
    State('start-date', 'value'),
    State('end-date', 'value'),
    State('agg-type', 'value')
)
def update_output(n_clicks, path, start_date, end_date, agg_type):
    if not path or not start_date or not end_date or not agg_type:
        return html.Div(), "⚠️ Please fill in all fields."

    try:
        data = pd.read_parquet(path)
        df = data.loc[start_date:end_date].copy()

        number_of_vars = 3
        number_of_chunks = 200
        vars = []

        for i in range(1, number_of_vars + 1):
            df[f'z_score__var{i}'] = (
                (df[f'true_value__var{i}'] - df[f'prediction_mu__var{i}']) / df[f'prediction_sigma__var{i}']
            )
            vars.append(f'z_score__var{i}')

        df = df[vars]

        z_agg, time_agg = aggregate_timeseries(df, n_chunks=number_of_chunks, method=agg_type)

        combined_df = pd.DataFrame({'time': time_agg})
        for i in range(z_agg.shape[0]):
            combined_df[f'z_score_var{i+1}'] = z_agg[i]

        # Combined plot (melted)
        melted_df = pd.melt(combined_df, id_vars='time', var_name='variable', value_name='z_score')
        combined_fig = px.line(melted_df, x='time', y='z_score', color='variable',
                               title='Combined Z-scores over Time')

        # Individual plots
        individual_figs = []
        for i in range(z_agg.shape[0]):
            df_plot = pd.DataFrame({
                'time': time_agg,
                'z_score': z_agg[i]
            })
            fig = px.line(df_plot, x='time', y='z_score', title=f'Z-score var{i+1} over Time')
            individual_figs.append(dcc.Graph(figure=fig))

        return html.Div([
            html.H4("Combined Plot:"),
            dcc.Graph(figure=combined_fig),
            html.H4("Individual Plots:"),
            *individual_figs
        ]), html.Pre(combined_df.head().to_string())

    except Exception as e:
        return html.Div(), f"❌ Error: {str(e)}"

if __name__ == '__main__':
    app.run(debug=True)

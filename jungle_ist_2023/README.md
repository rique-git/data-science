# Jungle 2023 IST Case — Time-Series Aggregator

This project is a solution to the Jungle 2023 IST Case Challenge. It implements a Python package for time-series downsampling and aggregation using Z-scores. The tool is designed to efficiently process model output predictions (mean and standard deviation) for multiple variables (e.g., wind turbine sensors), allowing fast visualization and analysis.

---

## 🚀 Features

- Reads `.parquet` files containing model predictions.
- Calculates Z-scores for each timestamp and variable.
- Aggregates data using vectorized NumPy operations.
- Supports aggregation methods like `mean` and `max`.
- Downsamples selected time ranges to exactly 200 points.
- Outputs Z-score and timestamp arrays ready for plotting.

---

## 🔧 How to Run

You can run the program in one of two ways:

### Option 1: Run directly

1. Navigate into the folder pip_package_components
2. Run the script main.py

### Option 2: Install as a pip package

1. Unzip the project folder.
2. Navigate to the root of the package (where `setup.py` is located).
3. Install it using pip: pip install .
4. After installation, you can run the tool directly from the command line: jungle_aggregator

### Option 3: Run GUI
1. Navigate into the folder dash_GUI
2. Run the script app.py
3. Open the URL in the browser (usually http://127.0.0.1:8050/)

---

## 📝 What It Does

- Loads a `.parquet` file containing model predictions (`x`, `mu`, `sigma`) for multiple variables.
- Computes Z-score values for each timestamp using the formula:  
  `Z = (x - mu) / sigma`
- Prompts the user to:
  - Select a time range (start and end date).
  - Choose an aggregation method: `mean`, `median`, `max`, `min` or `std`.
- Downsamples the Z-score time-series to **200 points per variable**.
- Outputs two arrays:
  - A **Z-score array** with shape `(3, 200)` — one row per variable.
  - A **timestamp array** with shape `(200,)`.

These arrays can be used for visualization with tools like Plotly.

---

## 📦 Requirements

The package uses the following Python libraries:

- `numpy`
- `pandas`
- `pyarrow`

These are automatically installed when using `pip install .`


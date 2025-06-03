from setuptools import setup, find_packages

setup(
    name="jungle_aggregator",
    version="0.1",
    packages=find_packages(),
    install_requires=["numpy", "pandas", "pyarrow"],
    entry_points={
        "console_scripts": [
            "jungle_aggregator=jungle_aggregator.main:main"
        ]
    }
)

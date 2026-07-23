from setuptools import setup

setup(
    name="peoples-bank-rates-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for People's Bank Rates (educational)",
    url="https://github.com/Cookie-Cat21/peoples-bank-rates-docs",
    packages=["peoples_bank_rates_docs"],
    package_dir={"peoples_bank_rates_docs": "peoples_bank_rates_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)

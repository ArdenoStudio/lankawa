from setuptools import setup

setup(
    name="dfcc-rates-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for DFCC Rates & Card Offers (educational)",
    url="https://github.com/Cookie-Cat21/dfcc-rates-docs",
    packages=["dfcc_rates_docs"],
    package_dir={"dfcc_rates_docs": "dfcc_rates_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)

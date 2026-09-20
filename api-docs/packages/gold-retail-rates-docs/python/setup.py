from setuptools import setup

setup(
    name="gold-retail-rates-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for Gold retail rates research pack (educational)",
    url="https://github.com/Cookie-Cat21/gold-retail-rates-docs",
    packages=["gold_retail_rates_docs"],
    package_dir={"gold_retail_rates_docs": "gold_retail_rates_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)

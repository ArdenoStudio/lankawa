from setuptools import setup

setup(
    name="boc-rates-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for Bank of Ceylon Rates (educational)",
    url="https://github.com/Cookie-Cat21/boc-rates-docs",
    packages=["boc_rates_docs"],
    package_dir={"boc_rates_docs": "boc_rates_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)

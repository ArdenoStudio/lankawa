from setuptools import setup

setup(
    name="sdb-rates-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for SANASA Development Bank rates (educational)",
    url="https://github.com/Cookie-Cat21/sdb-rates-docs",
    packages=["sdb_rates_docs"],
    package_dir={"sdb_rates_docs": "sdb_rates_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)

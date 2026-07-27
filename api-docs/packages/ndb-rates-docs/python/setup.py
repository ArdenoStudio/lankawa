from setuptools import setup

setup(
    name="ndb-rates-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for NDB Rates (educational)",
    url="https://github.com/Cookie-Cat21/ndb-rates-docs",
    packages=["ndb_rates_docs"],
    package_dir={"ndb_rates_docs": "ndb_rates_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)

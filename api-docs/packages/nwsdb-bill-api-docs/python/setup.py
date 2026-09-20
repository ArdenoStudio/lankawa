from setuptools import setup

setup(
    name="nwsdb-bill-api-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for NWSDB Bill Calculator API (educational)",
    url="https://github.com/Cookie-Cat21/nwsdb-bill-api-docs",
    packages=["nwsdb_bill_api_docs"],
    package_dir={"nwsdb_bill_api_docs": "nwsdb_bill_api_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)

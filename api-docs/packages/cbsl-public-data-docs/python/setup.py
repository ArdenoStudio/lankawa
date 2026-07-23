from setuptools import setup

setup(
    name="cbsl-public-data-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for CBSL Public Data (educational)",
    url="https://github.com/Cookie-Cat21/cbsl-public-data-docs",
    packages=["cbsl_public_data_docs"],
    package_dir={"cbsl_public_data_docs": "cbsl_public_data_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)

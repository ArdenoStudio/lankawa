from setuptools import setup

setup(
    name="combank-api-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for Commercial Bank API (educational)",
    url="https://github.com/Cookie-Cat21/combank-api-docs",
    packages=["combank_api_docs"],
    package_dir={"combank_api_docs": "combank_api_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
